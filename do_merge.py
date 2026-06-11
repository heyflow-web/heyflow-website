import os

try:
    import pypdf
except ImportError:
    print("pypdf is not installed.")
    exit(1)

pdf_dir = "/Users/myeon/Desktop/Agent(안티그래비티)/바인딩"
merger = pypdf.PdfWriter()

# 1부터 22까지 중 13번을 제외하고 순서대로 병합
for i in range(1, 23):
    if i == 13:
        print("Skipping: 13.pdf")
        continue

    path = os.path.join(pdf_dir, f"{i}.pdf")
    if os.path.exists(path):
        merger.append(path)
        print(f"Added: {i}.pdf")
    else:
        print(f"File not found: {i}.pdf")

output_path = os.path.join(pdf_dir, "merged_result_no13.pdf")
merger.write(output_path)
merger.close()
print(f"13번을 제외하고 성공적으로 병합되었습니다! 결과 파일: {output_path}")
