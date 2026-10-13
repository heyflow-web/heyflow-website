// ==========================================
// 체험단 라운지 통합 웹훅 & 관리자 대시보드 연동 최신 스크립트
// ==========================================
// 적용 방법:
// 1. 구글 시트 상단 메뉴: [확장 프로그램] -> [Apps Script] 클릭
// 2. 기존 코드 전체를 지우고 아래 코드 전체 붙여넣기
// 3. 우측 상단 파란색 [배포] -> [새 배포] 클릭
//    - 유형: 웹 앱 (Web app)
//    - 다음 사용자 권한으로 실행: 나 (Me)
//    - 액세스 권한: 모든 사용자 (Anyone)
// 4. 배포 완료! (기존 웹앱 URL 그대로 유지됩니다)

var TARGET_FOLDER_ID = "1j7Jlt2LWPkFzbg2wyEvfaxFgGf7sYgSo";

function getTargetFolder() {
  try {
    return DriveApp.getFolderById(TARGET_FOLDER_ID);
  } catch (e) {
    return DriveApp.getRootFolder();
  }
}

// 1. 관리자 대시보드 실시간 데이터 조회 (GET)
function doGet(e) {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("Salman") || spreadsheet.getSheets()[0];
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var submittedAt = row[0] ? String(row[0]) : "";
      var recruitInfo = row[1] ? String(row[1]) : "";
      var status = row[2] ? String(row[2]) : "대기중";
      var confirmedDate = row[3] ? String(row[3]) : "";
      var memo = row[4] ? String(row[4]) : "";

      if (submittedAt || recruitInfo) {
        rows.push({
          rowId: i + 1,
          submittedAt: submittedAt,
          recruitInfo: recruitInfo,
          status: status,
          confirmedDate: confirmedDate,
          memo: memo
        });
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", rows: rows }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. 지원서 수집 및 관리자 상태 업데이트 (POST)
function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("Salman") || spreadsheet.getSheets()[0];

    // [관리자 액션] 행 상태/확정일/메모 업데이트
    if (data.action === "updateStatus") {
      var targetRow = parseInt(data.rowId, 10);
      if (targetRow && targetRow > 1) {
        if (data.status !== undefined) sheet.getRange(targetRow, 3).setValue(data.status);
        if (data.confirmedDate !== undefined) sheet.getRange(targetRow, 4).setValue(data.confirmedDate);
        if (data.memo !== undefined) sheet.getRange(targetRow, 5).setValue(data.memo);
      }
      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", message: "상태 업데이트 완료" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // [신규 지원서 접수]
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["신청일시", "모집정보", "상태", "확정예약일", "관리자메모"]);
    }

    var now = new Date();
    var dateString = data.submittedAt || Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    var hospitalName = data.hospital || "";
    var categoryName = data.category || "";
    var campaignTitle = data.campaignTitle || "";
    var applicantName = data.name || "지원자";
    var finalImageUrls = [];
    var rawImages = data.rawImages || data.images || [];

    // 드라이브 사진 업로드
    if (rawImages && rawImages.length > 0) {
      var folder = getTargetFolder();
      for (var i = 0; i < rawImages.length; i++) {
        var imgItem = rawImages[i];
        var base64Data = (typeof imgItem === "object" && imgItem.dataUrl) ? imgItem.dataUrl : imgItem;
        if (typeof base64Data === "string" && base64Data.indexOf("data:") === 0) {
          try {
            var parts = base64Data.split(",");
            var raw = parts[1] ? parts[1].replace(/ /g, "+") : parts[0];
            var decoded = Utilities.base64Decode(raw);
            var safeFileName = "[" + applicantName + "] (" + hospitalName + ")" + categoryName + " - " + (i + 1) + ".jpg";
            var blob = Utilities.newBlob(decoded, "image/jpeg", safeFileName);
            var file = folder.createFile(blob);
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            finalImageUrls.push(file.getUrl());
          } catch(photoErr) {
            Logger.log("사진 업로드 에러: " + photoErr.toString());
          }
        } else if (typeof base64Data === "string" && base64Data.indexOf("http") === 0) {
          finalImageUrls.push(base64Data);
        }
      }
    }

    var recruitInfoLines = [
      "[" + hospitalName + "/" + categoryName + "]",
      "이름 : " + applicantName,
      "연락처 : " + (data.phone || "-"),
      "생년월일 : " + (data.birthdate || "-"),
      "블로그주소 : " + (data.blogUrl || "-"),
      "희망시술 : " + (campaignTitle || "-"),
      "희망예약일자 :",
      "- 1지망 : " + (data.schedule1 || "-"),
      "- 2지망 : " + (data.schedule2 || "-"),
      "- 3지망 : " + (data.schedule3 || "-")
    ];

    if (data.imageNote) recruitInfoLines.push("시술부위 상세설명 : " + data.imageNote);
    if (finalImageUrls.length > 0) {
      recruitInfoLines.push("첨부사진URL :");
      for (var k = 0; k < finalImageUrls.length; k++) recruitInfoLines.push(finalImageUrls[k]);
    }
    if (data.userNote) recruitInfoLines.push("특이사항 : " + data.userNote);

    sheet.appendRow([dateString, recruitInfoLines.join("\n"), "대기중", "", ""]);

    // 이메일 알림 전송 (옵션)
    try {
      var emailSubject = "[" + (hospitalName || "체험단") + "] 새로운 지원서가 접수되었습니다 - " + applicantName;
      var htmlLines = [
        "<h3>체험단 지원서 접수 알림</h3>",
        "<p><b>신청일시:</b> " + dateString + "</p>",
        "<p><b>병원명:</b> " + (hospitalName || "-") + "</p>",
        "<p><b>캠페인명:</b> " + (campaignTitle || "-") + "</p>",
        "<hr>",
        "<p><b>이름:</b> " + applicantName + "</p>",
        "<p><b>연락처:</b> " + (data.phone || "-") + "</p>",
        "<p><b>블로그:</b> <a href='" + (data.blogUrl || "") + "'>" + (data.blogUrl || "-") + "</a></p>",
        "<p><b>1지망:</b> " + (data.schedule1 || "-") + "</p>",
        "<p><b>2지망:</b> " + (data.schedule2 || "-") + "</p>",
        "<p><b>3지망:</b> " + (data.schedule3 || "-") + "</p>"
      ];
      MailApp.sendEmail({
        to: "gkt0108@gmail.com, team.archivehey@gmail.com",
        subject: emailSubject,
        htmlBody: htmlLines.join("")
      });
    } catch(mailErr) {}

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", message: "저장 완료" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
