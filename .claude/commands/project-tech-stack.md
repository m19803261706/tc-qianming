# 项目技术栈配置

---
description: "太初签名项目技术栈配置。本项目使用 Spring Boot 3.2.0 后端 + Next.js 前端。所有代码生成应遵循此配置。"
---

## 项目技术栈

### 后端
- **框架**: Spring Boot 3.2.0
- **语言**: Java 17
- **ORM**: Spring Data JPA + Hibernate
- **数据库**: MySQL 8.0
- **迁移**: Flyway
- **包路径**: `cn.tcxingji.seal`

### 前端（规划中）
- **框架**: Next.js 14+
- **语言**: TypeScript
- **样式**: Tailwind CSS

## 代码规范

所有代码生成应参考：
- `/spring-boot` Skill 的后端规范
- `/nextjs` Skill 的前端规范

## 文件结构

```
tc-qianming/
├── backend/                    # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/java/cn/tcxingji/seal/
│       ├── controller/
│       ├── service/
│       ├── entity/
│       ├── repository/
│       ├── dto/
│       └── exception/
└── frontend/                   # Next.js 前端（待创建）
    ├── package.json
    └── app/
```

## 数据库连接

```yaml
host: 60.10.230.150
port: 3306
database: dianziqian
username: root
password: asd123
```

此文件作为项目上下文，帮助 Claude Code 正确识别技术栈。
