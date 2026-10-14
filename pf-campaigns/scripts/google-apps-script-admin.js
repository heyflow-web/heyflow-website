// 사이트가 ?action=campaigns 로 부르면 '캠페인' 탭의 모집 목록을 JSON으로 돌려준다.
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === "campaigns") {
    return ContentService
      .createTextOutput(JSON.stringify(readCampaigns_()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ result: "success", message: "체험단 지원서 Webhook 정상 동작 중" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function readCampaigns_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("사이트관리");
  if (!sh || sh.getLastRow() < 2) return [];
  var vals = sh.getDataRange().getValues();
  var h = vals[0].map(function (x) { return String(x).trim(); });
  var col = function (r, n) { var j = h.indexOf(n); return j < 0 ? "" : String(r[j]).trim(); };
  var lines = function (t) { return t ? t.split("\n").map(function (x) { return x.trim(); }).filter(Boolean) : []; };
  var out = [];
  for (var i = 1; i < vals.length; i++) {
    var r = vals[i];
    var status = col(r, "상태");
    if (!col(r, "ID") || status === "숨김") continue; // 상태가 '숨김'이면 사이트에 내보내지 않음
    out.push({
      id: col(r, "ID"),
      status: status || "모집중",
      hospital: col(r, "병원"),
      category: col(r, "카테고리"),
      title: col(r, "캠페인명"),
      location: col(r, "지역") || "서울 강남",
      channel: col(r, "채널") || "블로그",
      offer: col(r, "제공혜택"),
      copay: col(r, "본인부담"),
      visits: col(r, "방문횟수") || "1회 방문",
      description: col(r, "제공혜택"),
      benefits: lines(col(r, "혜택상세")),
      missions: lines(col(r, "리뷰미션")),
      conditions: lines(col(r, "신청조건")),
      notices: lines(col(r, "필수유의사항")),
      schedule: {
        announcement: col(r, "발표일정") || "신청서 검토 후 순차 개별 연락드립니다.",
        activity: col(r, "활동일정") || "선정 직후 예약 일정 조율 후 내원 진행합니다."
      }
    });
  }
  return out;
}

// 체험단 지원서 사진은 고객사별 '02_지원서사진' 폴더에 쌓는다. (고객사 이름 = 병원정보 탭의 '고객사')
// 새 고객사가 생기면 아래에 "고객사": "폴더ID" 한 줄만 추가하면 된다.
var PHOTO_FOLDERS = {
  "살만": "1j7Jlt2LWPkFzbg2wyEvfaxFgGf7sYgSo",
  "큐어람": "1VQihiH2xh_UjIcg5kvT0oOxEbM2VQ9VG"
};
var PHOTO_FOLDER_DEFAULT = "살만"; // 고객사를 못 찾았을 때 쓰는 폴더

// 병원 이름 → 고객사 이름 ('병원정보' 탭의 '시트의 표기' → '고객사'). 접수 알림 메일 제목에 쓴다.
function clientOf_(hospital) {
  var h = String(hospital || "").replace(/\s+/g, "");
  if (!h) return "고객사 미확인";
  try {
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("병원정보");
    if (!sh) return "고객사 미확인";
    var rows = sh.getDataRange().getValues().slice(1);
    for (var i = 0; i < rows.length; i++) { // 정확히 같은 표기
      if (String(rows[i][0]).replace(/\s+/g, "") === h && rows[i][4]) return String(rows[i][4]).trim();
    }
    for (var j = 0; j < rows.length; j++) { // 한쪽이 다른 쪽을 포함 (예: '큐어람' / '큐어람한의원')
      var k = String(rows[j][0]).replace(/\s+/g, "");
      if (k && rows[j][4] && (h.indexOf(k) >= 0 || k.indexOf(h) >= 0)) return String(rows[j][4]).trim();
    }
  } catch (err) {
    Logger.log("client lookup err: " + err.toString());
  }
  return "고객사 미확인";
}

// 고객사에 맞는 사진 폴더를 돌려준다. 목록에 없으면 기본 폴더(살만).
function getOrCreateFolder(client) {
  var id = PHOTO_FOLDERS[client] || PHOTO_FOLDERS[PHOTO_FOLDER_DEFAULT];
  if (!PHOTO_FOLDERS[client]) Logger.log("사진 폴더: '" + client + "' 미등록 → 기본 폴더 사용");
  return DriveApp.getFolderById(id);
}

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);

    // 관리자 화면 요청(action 포함)은 비밀키를 확인한 뒤 따로 처리한다. 지원서 접수에는 action이 없다.
    if (data && data.action) return admRoute_(data);

    // 1. 현재 시트에서 "DB" 탭 가져오기 (예전 이름 "접수DB"도 인식, 없으면 자동 생성)
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("DB") || ss.getSheetByName("접수DB");
    if (!sheet) {
      sheet = ss.insertSheet("DB");
    }

    var now = new Date();
    var dateString = Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");

    // 2. 첨부 사진을 구글 드라이브에 저장하고 링크 추출
    var finalImageUrls = [];
    var rawImages = data.rawImages || data.images || [];
    var folder = null;
    try {
      folder = getOrCreateFolder(clientOf_(data.hospital));
    } catch (fErr) {
      Logger.log("Folder access err: " + fErr.toString());
    }

    var driveNameBase = data.driveFileName || (data.name + "_" + (data.campaignId || "캠페인"));

    for (var i = 0; i < rawImages.length; i++) {
      var driveUrl = "";
      var fileName = driveNameBase + "_사진" + (i + 1) + ".jpg";

      if (folder && rawImages[i] && typeof rawImages[i] === "string" && rawImages[i].indexOf("data:image") === 0) {
        try {
          var parts = rawImages[i].split(",");
          var contentType = (parts[0].match(/:(.*?);/) || [])[1] || "image/jpeg";
          var base64 = parts[1];
          var blob = Utilities.newBlob(Utilities.base64Decode(base64), contentType, fileName);
          var file = folder.createFile(blob);
          driveUrl = file.getUrl();
        } catch (e1) {
          Logger.log("Drive save err: " + e1.toString());
        }
      }

      if (driveUrl) {
        finalImageUrls.push(driveUrl);
      }
    }

    var imagesString = finalImageUrls.join("\n");

    // 3. 컬럼 헤더 자동 인식 및 데이터 매핑
    var headers = [];
    if (sheet.getLastRow() > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }

    // 만약 시트가 완전히 비어있다면 기본 헤더 자동 생성
    if (headers.length === 0 || !headers[0]) {
      headers = [
        "신청일시", "캠페인ID", "클리닉", "희망시술", "카테고리",
        "이름", "생년월일", "연락처", "블로그주소",
        "블로그지수", "1지망", "2지망", "3지망",
        "개인정보동의", "6개월유지동의", "미션수행동의", "마케팅동의", "일정변경불가동의",
        "첨부사진링크", "시술부위 상세설명", "지원동기",
        "공유상태", "점검", "고객사", "모집정보(원문)", "키",
        "진행상태", "예약일", "원고 발행일", "키워드", "발행원고 URL", "성과", "이슈", "룸동기값"
      ];
      sheet.appendRow(headers);
    }

    // 각 헤더명에 대응하는 데이터 매핑 사전
    var fieldMap = {
      "신청일시": dateString,
      "일시": dateString,
      "접수일시": dateString,
      "캠페인ID": data.campaignId || "",
      "캠페인명": data.campaignTitle || "",
      "병원": data.hospital || "",
      "병원명": data.hospital || "",
      "클리닉": data.hospital || "",
      "희망시술": data.campaignTitle || "",
      "카테고리": data.category || "",
      "이름": data.name || "",
      "지원자": data.name || "",
      "지원자명": data.name || "",
      "생년월일": data.birthdate || "",
      "연락처": data.phone || "",
      "전화번호": data.phone || "",
      "휴대폰": data.phone || "",
      "블로그": data.blogUrl || "",
      "블로그주소": data.blogUrl || "",
      "1지망일정": data.schedule1 || "",
      "1지망": data.schedule1 || "",
      "2지망일정": data.schedule2 || "",
      "2지망": data.schedule2 || "",
      "3지망일정": data.schedule3 || "",
      "3지망": data.schedule3 || "",
      "개인정보동의": data.agreePrivacy ? "동의" : "미동의",
      "6개월유지동의": data.agreeRetention ? "동의" : "미동의",
      "유지동의": data.agreeRetention ? "동의" : "미동의",
      "미션수행동의": data.agreeMission ? "동의" : "미동의",
      "미션동의": data.agreeMission ? "동의" : "미동의",
      "마케팅동의": data.agreeMarketing ? "동의" : "미동의",
      "일정변경불가동의": data.agreeNoChange ? "동의" : "미동의",
      "일정변경동의": data.agreeNoChange ? "동의" : "미동의",
      "첨부사진링크": imagesString,
      "첨부사진": imagesString,
      "사진": imagesString,
      "사진링크": imagesString,
      "부위설명/특이사항": data.imageNote || "",
      "부위설명": data.imageNote || "",
      "시술부위 상세설명": data.imageNote || "",
      "특이사항": data.userNote || "",
      "지원동기": data.userNote || "",
      "지원동기/체험소감": data.userNote || "",
      "체험소감": data.userNote || ""
    };

    var rowData = [];
    for (var k = 0; k < headers.length; k++) {
      var colHeader = String(headers[k]).trim();
      rowData.push(fieldMap[colHeader] !== undefined ? fieldMap[colHeader] : "");
    }
    sheet.appendRow(rowData);

    // 연락처·생년월일은 문자로 다시 써서 앞자리 0이 사라지지 않게 한다
    var newRow = sheet.getLastRow();
    for (var c = 0; c < headers.length; c++) {
      var hn = String(headers[c]).trim();
      if (hn === "연락처" || hn === "전화번호" || hn === "휴대폰" || hn === "생년월일" || hn === "신청일시") {
        var cell = sheet.getRange(newRow, c + 1);
        cell.setNumberFormat("@");
        cell.setValue(String(rowData[c]));
      }
    }

    // 4. 관리자 알림 이메일 발송
    var emailRecipients = ["gkt0108@gmail.com", "team.archivehey@gmail.com"];
    var emailSubject = "[🍊체험단 지원자] " + clientOf_(data.hospital) + " / " + (data.hospital || "병원 미확인") + " 지원자 등장 📩";

    var emailBodyHtml = "<h3>체험단 지원서 접수 알림</h3>" +
      "<p><b>신청일시 :</b> " + dateString + "</p>" +
      "<p><b>병원명 :</b> " + (data.hospital || "-") + "</p>" +
      "<p><b>캠페인명 :</b> " + (data.campaignTitle || "-") + "</p>" +
      "<p><b>이름 :</b> " + (data.name || "") + "</p>" +
      "<p><b>연락처 :</b> " + (data.phone || "") + "</p>" +
      "<p><b>생년월일 :</b> " + (data.birthdate || "-") + "</p>" +
      "<p><b>블로그주소 :</b> <a href='" + (data.blogUrl || "") + "'>" + (data.blogUrl || "") + "</a></p>" +
      "<p><b>1지망 일정 :</b> " + (data.schedule1 || "") + "</p>" +
      "<p><b>2지망 일정 :</b> " + (data.schedule2 || "") + "</p>" +
      "<p><b>3지망 일정 :</b> " + (data.schedule3 || "") + "</p>" +
      "<p><b>첨부사진 (구글 드라이브 링크) :</b><br>" + (imagesString ? imagesString.split("\n").map(function(url){ return "<a href='" + url + "' target='_blank'>" + url + "</a>"; }).join("<br>") : "없음") + "</p>" +
      "<p><b>시술부위 상세설명 :</b> " + (data.imageNote || "-") + "</p>" +
      "<p><b>지원동기 :</b> " + (data.userNote || "-") + "</p>";

    for (var j = 0; j < emailRecipients.length; j++) {
      try {
        MailApp.sendEmail({
          to: emailRecipients[j],
          subject: emailSubject,
          htmlBody: emailBodyHtml
        });
      } catch (e) {
        Logger.log("Email send error: " + e.toString());
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", message: "구글 시트 저장 및 드라이브 보관 완료" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 📌 권한 승인 및 드라이브 폴더 생성 확인용 함수
function authorizeEverything() {
  Object.keys(PHOTO_FOLDERS).forEach(function (c) {
    Logger.log("📁 1. " + c + " 사진 폴더 연결 성공: " + getOrCreateFolder(c).getName());
  });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DB") || ss.getSheetByName("접수DB") || ss.insertSheet("DB");
  Logger.log("📊 2. 시트 'DB' 탭 연결 성공: " + sheet.getName());
}

/* =====================================================================
 * 관리자 화면(pf-campaigns /admin) 연동
 *  - 모든 요청은 POST + 비밀키(스크립트 속성 ADMIN_API_SECRET)로 확인한다. 키가 없으면 아무것도 읽거나 쓰지 않는다.
 *  - 열은 이름이 아니라 자동화와 같은 열 번호(C_*)로 읽고 쓴다. 열 순서가 다르면(layoutOk_) 멈춘다.
 *  - 행은 '행 번호 + 키'로 확인한다. 행이 밀렸으면 거절한다.
 * ===================================================================== */

function admOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function admErr_(msg, issues) {
  var o = { result: 'error', message: msg };
  if (issues && issues.length) o.issues = issues;
  return admOut_(o);
}

function admRoute_(data) {
  var secret = PropertiesService.getScriptProperties().getProperty('ADMIN_API_SECRET');
  if (!secret || String(data.token || '') !== secret) return admErr_('인증에 실패했어요. ADMIN_API_SECRET을 확인해 주세요.');
  if (!layoutOk_()) return admErr_('DB 탭 열 순서가 자동화와 달라 멈췄어요.');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(40000)) return admErr_('자동 동기화가 진행 중이에요. 1분 뒤에 다시 시도해 주세요.');
  try {
    switch (data.action) {
      case 'listApplications': return admList_();
      case 'updateFields': return admUpdateFields_(data);
      case 'setShare': return admSetShare_(data);
      case 'deleteRow': return admDelete_(data);
      case 'markSent': return admMarkSent_(data);
      case 'saveMessage': return admSaveMessage_(data);
    }
    return admErr_('알 수 없는 요청: ' + data.action);
  } catch (err) {
    return admErr_(String(err && err.message ? err.message : err));
  } finally {
    lock.releaseLock();
  }
}

function admRead_(r, c) { return String(r[c - 1] === undefined || r[c - 1] === null ? '' : r[c - 1]).trim(); }

function admList_() {
  var db = dbSheet_();
  var last = db.getLastRow();
  var rows = [];
  if (last >= 2) {
    var vals = db.getRange(2, 1, last - 1, C_SNAP).getDisplayValues();
    for (var i = 0; i < vals.length; i++) {
      var r = vals[i];
      if (!admRead_(r, C_NAME) && !admRead_(r, C_TS)) continue;
      var photos = admRead_(r, C_PHOTO);
      rows.push({
        rowId: i + 2,
        syncKey: admRead_(r, C_KEY),
        submittedAt: admRead_(r, C_TS),
        name: admRead_(r, C_NAME),
        sheetName: admRead_(r, C_NAME),
        sheetPhone: admRead_(r, C_PHONE),
        sheetBlog: admRead_(r, C_BLOG),
        shareStatus: admRead_(r, C_STATE),
        checkStatus: admRead_(r, C_WARN),
        status: canonStatus_(admRead_(r, C_PROG)) || '1.신규지원',
        hospital: admRead_(r, C_CLINIC),
        treatment: admRead_(r, C_PROC),
        category: admRead_(r, C_CAT),
        birthdate: admRead_(r, C_BIRTH),
        phone: admRead_(r, C_PHONE),
        blogUrl: admRead_(r, C_BLOG),
        blogIndex: admRead_(r, C_IDX),
        schedule1: admRead_(r, C_W1),
        schedule2: admRead_(r, C_W2),
        schedule3: admRead_(r, C_W3),
        images: photos ? photos.split('\n').map(function (x) { return x.trim(); }).filter(Boolean) : [],
        imageNote: admRead_(r, C_PART),
        userNote: admRead_(r, C_NOTE),
        client: admRead_(r, C_CLIENT),
        recruitInfo: admRead_(r, C_RAW),
        confirmedDate: admRead_(r, C_RES),
        postDate: admRead_(r, C_PUB),
        postUrl: admRead_(r, C_URL),
        performance: admRead_(r, C_PERF),
        memo: admRead_(r, C_ISSUE),
        guideRoom: admRead_(r, C_GUIDE),
        roomSynced: admRead_(r, C_SNAP) !== ''
      });
    }
  }
  // 자동으로 만들어진 문자 (문자발송 탭)
  var messages = [];
  var out = SpreadsheetApp.getActive().getSheetByName(OUT_SHEET);
  if (out && out.getLastRow() >= 2) {
    out.getRange(2, 1, out.getLastRow() - 1, 10).getValues().forEach(function (m, i) {
      if (!m[0]) return;
      messages.push({ key: String(m[0]), tpl: String(m[1]), client: String(m[2]), name: String(m[3]),
        phone: String(m[4]).replace(/\D/g, ''), text: String(m[5]), warn: String(m[6]),
        madeAt: String(m[7]), sent: m[8] === true });
    });
  }
  return admOut_({ result: 'success', rows: rows, messages: messages });
}

/** 화면에서 본 지원자가 시트의 그 행과 같은지 확인한다. 같으면 행 번호를 돌려준다. */
function admRow_(db, id) {
  var row = parseInt(id && id.rowId, 10);
  if (!row || row < 2 || row > db.getLastRow()) throw new Error('행 번호가 달라졌어요. 새로고침 후 다시 시도해 주세요.');
  var r = db.getRange(row, 1, 1, C_SNAP).getDisplayValues()[0];
  var sheetKey = admRead_(r, C_KEY);
  var idKey = String(id.key || '').trim();
  // 키가 양쪽에 있으면 키로 확인한다. 화면이 불러올 때는 키가 없었는데 그사이 자동화가 키를 채운 새 지원자는 이름+신청일시로 확인한다.
  var ok = (sheetKey && idKey)
    ? sheetKey === idKey
    : (admRead_(r, C_NAME) === String(id.name || '').trim() && admRead_(r, C_TS) === String(id.submittedAt || '').trim());
  if (!ok) throw new Error('시트에서 행이 바뀌었어요(' + admRead_(r, C_NAME) + '). 새로고침 후 다시 시도해 주세요.');
  return { row: row, vals: r };
}

function admDate_(v, withTime) {
  v = String(v || '').trim();
  if (!v) return '';
  var m = v.match(/(\d{4})[-./년\s]+(\d{1,2})[-./월\s]+(\d{1,2})/);
  if (!m) throw new Error('날짜 형식을 확인해 주세요: ' + v);
  var d = m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  if (!withTime) return d;
  var t = v.match(/(\d{1,2}):(\d{2})/);
  if (!t) {
    var pm = v.match(/(오전|오후)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);
    if (pm) {
      var h = Number(pm[2]) % 12 + (pm[1] === '오후' ? 12 : 0);
      return d + ' ' + ('0' + h).slice(-2) + ':' + ('0' + (pm[3] || 0)).slice(-2);
    }
    return d;
  }
  return d + ' ' + ('0' + t[1]).slice(-2) + ':' + t[2];
}

/** 바뀐 칸만 쓴다. 상태·예약일·원고 발행일·발행원고 URL·성과·이슈·블로그지수만 허용(가이드룸·키·모집정보 원문·룸동기값은 자동 칸이라 쓰지 않는다). */
function admUpdateFields_(data) {
  var db = dbSheet_();
  var hit = admRow_(db, data.id || data);
  var ch = data.changes || {};
  var warnings = [];
  var put = function (col, v) { db.getRange(hit.row, col).setNumberFormat('@').setValue(v); };
  if (ch.status !== undefined) {
    var st = canonStatus_(ch.status);
    if (ROOM_STATUSES.indexOf(st) < 0) throw new Error('진행상태 값이 올바르지 않아요: ' + ch.status);
    put(C_PROG, st);
  }
  if (ch.confirmedDate !== undefined) put(C_RES, admDate_(ch.confirmedDate, true));
  if (ch.postDate !== undefined) put(C_PUB, admDate_(ch.postDate, false));
  if (ch.postUrl !== undefined) put(C_URL, String(ch.postUrl).trim());
  if (ch.performance !== undefined) put(C_PERF, String(ch.performance).trim());
  if (ch.memo !== undefined) put(C_ISSUE, String(ch.memo));
  if (ch.blogIndex !== undefined) {
    put(C_IDX, String(ch.blogIndex).trim());
    refreshRows_(db, [hit.row]);
  }
  if (ch.phone !== undefined || ch.blogUrl !== undefined) {
    var newPhone = ch.phone !== undefined ? admPhone_(ch.phone) : admRead_(hit.vals, C_PHONE);
    var newBlog = ch.blogUrl !== undefined ? admBlog_(ch.blogUrl) : admRead_(hit.vals, C_BLOG);
    var contactNote = admContactChange_(db, hit, newPhone, newBlog);
    if (contactNote) warnings.push(contactNote);
  }
  var r = db.getRange(hit.row, 1, 1, C_SNAP).getDisplayValues()[0];
  // 프로젝트룸과 주고받는 칸(상태·예약일·발행일·발행URL·성과·이슈)을 바꿨고 이미 룸에 올라간 지원자라면, 10분을 기다리지 않고 바로 룸에 맞춘다
  var roomFields = ['status', 'confirmedDate', 'postDate', 'postUrl', 'performance', 'memo'];
  var touchedRoom = roomFields.some(function (k) { return ch[k] !== undefined; });
  if (touchedRoom && (admRead_(r, C_SNAP) || admWasPushed_(admRead_(r, C_KEY)))) {
    try {
      syncRoom_();
      r = db.getRange(hit.row, 1, 1, C_SNAP).getDisplayValues()[0];
    } catch (err) {
      warnings.push('시트에는 저장했지만 프로젝트룸에는 아직 반영하지 못했어요. 10분 안의 자동 동기화에서 반영돼요: ' + String(err && err.message ? err.message : err));
    }
  }
  var status = canonStatus_(admRead_(r, C_PROG));
  // 체험대기중(트리거 상태)이 되면 블로거 폴더를 바로 만든다 (10분을 기다리지 않음)
  if (ch.status !== undefined && status === String(getConfig_()['트리거 상태']).trim() && (admRead_(r, C_SNAP) || admWasPushed_(admRead_(r, C_KEY)))) {
    try {
      run();
      r = db.getRange(hit.row, 1, 1, C_SNAP).getDisplayValues()[0];
    } catch (err) {
      warnings.push('블로거 폴더는 10분 안의 자동 실행에서 만들어져요: ' + String(err && err.message ? err.message : err));
    }
  }
  if (status === '3.체험대기중' && !admRead_(r, C_RES)) warnings.push('예약일이 비어 있어요. 예약 전날·체험 후 문자가 만들어지지 않아요.');
  if (status === '6.발행완료' && !admRead_(r, C_PUB)) warnings.push('원고 발행일이 비어 있어요. 발행완료 문자가 만들어지지 않아요.');
  if (status === '7.드랍') warnings.push('드랍은 문자를 보내지 않아요.');
  return admOut_({ result: 'success', message: '저장했어요', data: { warnings: warnings, row: admRowObj_(r) } });
}

function admRowObj_(r) {
  return { status: canonStatus_(admRead_(r, C_PROG)), confirmedDate: admRead_(r, C_RES), postDate: admRead_(r, C_PUB),
    postUrl: admRead_(r, C_URL), performance: admRead_(r, C_PERF), memo: admRead_(r, C_ISSUE),
    blogIndex: admRead_(r, C_IDX), shareStatus: admRead_(r, C_STATE), checkStatus: admRead_(r, C_WARN),
    sheetPhone: admRead_(r, C_PHONE), sheetBlog: admRead_(r, C_BLOG), guideRoom: admRead_(r, C_GUIDE) };
}

/** 병원 프로젝트룸 공유 체크박스. 공유됨으로 바꾸면 10분 안에 자동화(pushShared_)가 룸에 올린다. */
function admSetShare_(data) {
  var db = dbSheet_();
  var hit = admRow_(db, data.id || data);
  if (data.shared) {
    refreshRows_(db, [hit.row]); // 점검을 최신으로
    var r = db.getRange(hit.row, 1, 1, C_SNAP).getDisplayValues()[0];
    var issues = [];
    if (!admRead_(r, C_IDX)) issues.push('블로그지수 입력이 누락되었어요!');
    if (admRead_(r, C_WARN)) issues.push('점검 내용을 먼저 확인해 주세요: ' + admRead_(r, C_WARN));
    if (!admRead_(r, C_CLIENT)) issues.push('고객사가 비어 있어요. 병원정보 탭에서 클리닉의 고객사를 확인해 주세요.');
    var fromDay = startDay_(getConfig_());
    var day = tsDay_(db.getRange(hit.row, C_TS).getValue());
    if (fromDay && day && day < fromDay) issues.push('공유 시작일(' + fromDay + ') 이전에 신청한 분이라 자동 공유 대상이 아니에요.');
    if (issues.length) return admErr_('공유 조건이 맞지 않아요.', issues);
    db.getRange(hit.row, C_STATE).setValue('공유됨');
    // 10분을 기다리지 않고 바로 프로젝트룸에 올린다
    var warnings = [];
    try {
      pushShared_();
    } catch (err) {
      warnings.push('공유됨으로는 바꿨지만 프로젝트룸에 올리지 못했어요: ' + String(err && err.message ? err.message : err));
    }
    if (isTrue_(getConfig_()['공유 연습 실행'])) warnings.push('설정의 "공유 연습 실행"이 켜져 있어 실제로는 올리지 않고 기록만 남겼어요.');
    return admOut_({ result: 'success', message: warnings.length ? '공유 상태를 바꿨어요.' : '병원 프로젝트룸에 공유했어요.', data: { shareStatus: '공유됨', warnings: warnings } });
  }
  if (admRead_(hit.vals, C_SNAP) || admWasPushed_(admRead_(hit.vals, C_KEY))) {
    return admErr_('이미 병원 프로젝트룸에 올라간 지원자예요.', ['공유된 리스트는 프로젝트룸에서만 삭제가 가능합니다.']);
  }
  db.getRange(hit.row, C_STATE).setValue('신규지원');
  return admOut_({ result: 'success', message: '공유를 해제했어요.', data: { shareStatus: '신규지원' } });
}

/** 완전삭제. 키로 같은 사람인지 확인한 뒤 지우고, 처리기록 탭에 누가 지워졌는지 남긴다. */
function admDelete_(data) {
  var db = dbSheet_();
  var hit = admRow_(db, data.id || data);
  var v = hit.vals;
  db.deleteRow(hit.row);
  try {
    logRow_(['관리자 삭제', new Date(), '완료', admRead_(v, C_CLIENT), INTAKE_SHEET, hit.row,
      admRead_(v, C_CLINIC) + ' ' + admRead_(v, C_NAME) + ' / ' + admRead_(v, C_KEY)]);
  } catch (e) {}
  return admOut_({ result: 'success', message: admRead_(v, C_NAME) + ' 지원서를 삭제했어요.' });
}

function admMsgRow_(key) {
  var out = SpreadsheetApp.getActive().getSheetByName(OUT_SHEET);
  if (!out || out.getLastRow() < 2) throw new Error('문자발송 탭이 비어 있어요.');
  var keys = out.getRange(2, 1, out.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < keys.length; i++) if (String(keys[i][0]) === String(key)) return { out: out, row: i + 2 };
  throw new Error('문자 행을 찾지 못했어요. 새로고침해 주세요.');
}
function admMarkSent_(data) {
  var h = admMsgRow_(data.key);
  h.out.getRange(h.row, 9).setValue(data.sent === false ? false : true);
  return admOut_({ result: 'success', message: data.sent === false ? '보냄 표시를 풀었어요.' : '보냄으로 표시했어요.' });
}
function admSaveMessage_(data) {
  var h = admMsgRow_(data.key);
  if (h.out.getRange(h.row, 9).getValue() === true) throw new Error('이미 보낸 문자는 고칠 수 없어요.');
  h.out.getRange(h.row, 6).setValue(String(data.text || ''));
  return admOut_({ result: 'success', message: '문구를 저장했어요. 자동 원문이 바뀌기 전까지 유지돼요.' });
}


/** 처리기록에 이 지원자를 룸에 올린 기록이 있는지 (룸동기값이 생기기 전에도 공유 해제를 막기 위해) */
function admWasPushed_(key) {
  if (!key) return false;
  var log = SpreadsheetApp.getActive().getSheetByName(LOG_SHEET);
  if (!log || log.getLastRow() < 2) return false;
  var rows = log.getRange(2, 1, log.getLastRow() - 1, 3).getValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][0]) === '공유|' + key && String(rows[i][2]) === '공유됨') return true;
  }
  return false;
}

/** 점검용: Apps Script 편집기에서 이 함수를 선택해 실행하면 실행 로그에 연결 상태가 나온다 (개인정보는 출력하지 않는다) */
function admSelfTest() {
  var db = dbSheet_();
  Logger.log('DB 탭: ' + (db ? db.getName() : '없음') + ' / 마지막 행: ' + (db ? db.getLastRow() : '-'));
  Logger.log('열 순서 OK: ' + layoutOk_());
  Logger.log('비밀키 설정됨: ' + !!PropertiesService.getScriptProperties().getProperty('ADMIN_API_SECRET'));
  var out = JSON.parse(admList_().getContent());
  Logger.log('결과: ' + out.result + ' / 지원자 ' + (out.rows || []).length + '명 / 문자 ' + (out.messages || []).length + '건 ' + (out.message || ''));
}


/** 연락처: 숫자만 남기고 010… 형태로 맞춘다 (앞자리 0이 빠진 10자리도 보정) */
function admPhone_(v) {
  var d = String(v || '').replace(/\D/g, '');
  if (d.length === 10 && d.indexOf('10') === 0) d = '0' + d;
  if (d.length < 10 || d.length > 11) throw new Error('연락처 형식을 확인해 주세요: ' + v);
  return d;
}
/** 블로그 주소: 앞에 https://가 없으면 붙인다 */
function admBlog_(v) {
  v = String(v || '').trim();
  if (!v) throw new Error('블로그 주소를 입력해 주세요.');
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v.replace(/^\/+/, '');
  return v;
}

/**
 * 연락처·블로그 주소를 바꾼다. 연락처는 시트의 '같은 지원서' 판단(연락처+클리닉+시술)에 쓰이므로,
 * 이미 프로젝트룸에 올라간 지원자는 룸의 모집정보 글과 만들어진 문자(문자발송 탭)도 같이 바꿔서 연결이 끊기지 않게 한다.
 * 돌려주는 값: 알려줄 내용(없으면 '')
 */
function admContactChange_(db, hit, newPhone, newBlog) {
  var oldPhone = admRead_(hit.vals, C_PHONE), oldBlog = admRead_(hit.vals, C_BLOG);
  if (oldPhone === newPhone && oldBlog === newBlog) return '';
  var oldRaw = admRead_(hit.vals, C_RAW);
  var key = admRead_(hit.vals, C_KEY);
  var inRoom = !!admRead_(hit.vals, C_SNAP) || admWasPushed_(key);
  var note = '';
  var clinics = loadClinics_(), maps = loadMaps_();
  var oldDk = oldRaw ? dupKey_(parseFull_(oldRaw), clinics, maps) : '';
  var strip = function (p) { return String(p).replace(/\D/g, '').replace(/^0+/, ''); };

  if (inRoom && oldDk) {
    var client = loadClients_().filter(function (c) { return c.name === admRead_(hit.vals, C_CLIENT); })[0];
    var fixed = 0;
    if (client && client.roomId) {
      SpreadsheetApp.openById(client.roomId).getSheets().forEach(function (sh) {
        var vals = sh.getDataRange().getValues();
        var h = findHeader_(vals);
        if (!h) return;
        for (var r = h.hr + 1; r < vals.length; r++) {
          var info = String(vals[r][h.infoCol]).trim();
          if (!info || dupKey_(parseFull_(info), clinics, maps) !== oldDk) continue;
          var next = info
            .replace(/(연락처\s*:\s*)[^\n]*/, function (m, a) { return a + newPhone; })
            .replace(/(블로그주소\s*:\s*)[^\n]*/, function (m, a) { return a + newBlog; });
          sh.getRange(r + 1, h.infoCol + 1).setValue(next);
          fixed++;
        }
      });
    }
    if (!fixed) note = '프로젝트룸에서 이 지원자 행을 찾지 못해 시트만 바꿨어요. 룸의 모집정보 글도 직접 고쳐 주세요.';
  }

  db.getRange(hit.row, C_PHONE).setNumberFormat('@').setValue(newPhone);
  db.getRange(hit.row, C_BLOG).setNumberFormat('@').setValue(newBlog);
  refreshRows_(db, [hit.row]); // 점검·모집정보 원문 새로고침

  // 이미 만들어진 문자(문자발송 탭)의 연락처·키도 새 번호로 맞춘다 (같은 문자가 다시 만들어지지 않게)
  if (oldDk && strip(oldPhone) !== strip(newPhone)) {
    var out = SpreadsheetApp.getActive().getSheetByName(OUT_SHEET);
    if (out && out.getLastRow() >= 2) {
      var newDk = strip(newPhone) + oldDk.slice(oldDk.indexOf('|'));
      var rows = out.getRange(2, 1, out.getLastRow() - 1, 5).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i][0]).indexOf(oldDk + '|') !== 0) continue;
        out.getRange(i + 2, 1).setValue(newDk + String(rows[i][0]).slice(oldDk.length));
        out.getRange(i + 2, 5).setValue(newPhone);
      }
    }
  }
  return note;
}
