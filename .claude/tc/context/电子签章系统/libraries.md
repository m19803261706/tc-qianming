# 技术文档参考 - 电子签章系统

## 1. Apache PDFBox (PDF 处理)

### 核心功能：在 PDF 中添加图片/印章

```java
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import java.io.IOException;

public class ImageToPDFExample {
    public static void main(String[] args) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            // 加载印章图片
            PDImageXObject pdImage = PDImageXObject.createFromFile("seal.png", doc);

            try (PDPageContentStream contents = new PDPageContentStream(doc, page)) {
                // 在指定坐标绘制印章 (x=20, y=20)
                contents.drawImage(pdImage, 20, 20);

                // 或者指定大小绘制
                // contents.drawImage(pdImage, x, y, width, height);
            }

            doc.save("signed_document.pdf");
        }
    }
}
```

### 关键 API
- `PDDocument.load()` - 加载 PDF 文档
- `PDImageXObject.createFromFile()` - 加载图片
- `PDPageContentStream.drawImage()` - 在指定坐标绘制图片
- 坐标系：左下角为原点 (0, 0)

---

## 2. Spring Boot (后端 API)

### 文件上传配置

```yaml
# application.yml
spring:
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB
```

### REST Controller 示例

```java
@RestController
@RequestMapping("/api/seals")
class SealController {

    @GetMapping
    public List<Seal> getAllSeals() {
        return sealService.findAll();
    }

    @PostMapping
    public ResponseEntity<Seal> createSeal(@RequestBody Seal seal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sealService.save(seal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Seal> updateSeal(@PathVariable Long id, @RequestBody Seal seal) {
        return ResponseEntity.ok(sealService.update(id, seal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeal(@PathVariable Long id) {
        sealService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 3. Next.js (前端)

### 客户端组件 - 使用 'use client' 指令

```typescript
'use client'
import { useState } from 'react'

export default function SignaturePad() {
  const [signature, setSignature] = useState<string | null>(null)

  return (
    <div>
      <canvas id="signatureCanvas" />
      <button onClick={() => saveSignature()}>保存签名</button>
    </div>
  )
}
```

### 关键点
- 交互组件需要 `'use client'` 指令
- Canvas 绑定需要在客户端组件中实现
- 文件上传使用 FormData

---

## 骑缝章实现思路

1. 获取 PDF 总页数
2. 将印章图片按页数垂直分割
3. 每页右侧边缘绘制对应的印章片段
4. 所有页印章片段组合后形成完整印章

```java
// 骑缝章核心逻辑
int totalPages = document.getNumberOfPages();
int sliceHeight = sealImage.getHeight() / totalPages;

for (int i = 0; i < totalPages; i++) {
    BufferedImage slice = sealImage.getSubimage(
        0,
        i * sliceHeight,
        sealImage.getWidth(),
        sliceHeight
    );
    // 在第 i 页右边缘绘制 slice
}
```
