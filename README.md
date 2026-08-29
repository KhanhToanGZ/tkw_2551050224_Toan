# Thực Hành Thiết Kế Web - Buổi 5

Dự án CloudForge - Cập nhật tính năng quản lý dữ liệu và Form liên hệ.

## 🔗 Links
- **Link Demo:** [Thêm link GitHub Pages/Vercel của bạn vào đây]
- **Link Figma:** [Thêm link Figma của bạn vào đây]

## 📸 Ảnh chụp màn hình
![Screenshot](./screenshot.png)
*(Lưu ý: Bạn hãy chụp ảnh màn hình dự án và lưu thành file `screenshot.png` ở thư mục gốc nhé)*

## ✨ Danh sách tính năng
- **Trang dữ liệu động (`records.html`):**
  - Load dữ liệu JSON bằng `fetch` và `async/await`.
  - Áp dụng mô hình `state -> render() -> DOM` chuyên nghiệp.
  - Hiển thị đầy đủ 4 trạng thái: Loading, Rỗng, Lỗi, Có dữ liệu.
  - Tìm kiếm thời gian thực với kỹ thuật `debounce`.
  - Lọc dữ liệu theo thể loại và trạng thái.
  - Sắp xếp dữ liệu theo ngày và số tiền.
  - Thêm, xóa bản ghi với dữ liệu lưu trữ bền vững qua `localStorage`.
- **Trang liên hệ (`contact.html`):**
  - Validation dữ liệu bằng HTML5 Constraint Validation API.
  - Hiển thị thông báo lỗi bằng tiếng Việt (Custom Validity).
  - Tự động nhảy focus về ô bị lỗi đầu tiên.
  - Hiển thị Toast thông báo khi submit thành công hoặc thất bại.
  - Tuân thủ Accessibility (A11y) với thuộc tính `aria-invalid`.

## 🚀 Hướng dẫn chạy
Để chạy dự án với đầy đủ tính năng và không bị lỗi CORS khi fetch file JSON:

1. Mở terminal tại thư mục gốc của dự án.
2. Cài đặt các gói phụ thuộc (nếu có) hoặc dùng công cụ serve:
   ```bash
   npx serve .
   ```
3. Mở trình duyệt và truy cập vào `http://localhost:3000` (hoặc cổng tương ứng).
4. Điều hướng tới trang `/records.html` hoặc `/contact.html`.

## 💡 3 điều tôi sẽ làm lại nếu có thêm thời gian
1. **Thiết kế component:** Tách các thành phần giao diện (như Toast, Table Row) thành các component Web Components hoặc dùng framework như React/Vue để quản lý state phức tạp hơn thay vì thuần Vanilla JS.
2. **Animation:** Thêm animation mượt mà khi thêm/xóa dòng trong bảng (dùng thư viện GSAP đã có sẵn trong dự án) thay vì chỉ thay thế DOM đơn thuần.
3. **Mở rộng dữ liệu:** Bổ sung tính năng phân trang (pagination) cho bảng dữ liệu và kết nối với Backend/Database thực tế thay vì chỉ mô phỏng bằng JSON và `localStorage`.
