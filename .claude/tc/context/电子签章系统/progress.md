# 电子签章系统 进度记录

## Epic 进度

🎯 Epic Issue: #1 - 太初星集电子签章系统
进度: ◉◉◉◉◉○○○○○○○○○○○○○○ 5/19 (26%)

## Phase 1: 数据库设计 ✅ 已完成

### #2 - 印章信息表设计 (seal_info)
- **完成时间**: 2026-01-01
- **提交**: `b1ba6fe`
- **类型**: database
- **变更**:
  - 新建:
    - `backend/pom.xml`
    - `backend/src/main/java/cn/tcxingji/seal/TcSealApplication.java`
    - `backend/src/main/resources/application.yml`
    - `backend/src/main/resources/db/migration/V1__create_seal_info_table.sql`
    - `backend/src/main/java/cn/tcxingji/seal/entity/SealInfo.java`
    - `backend/src/main/java/cn/tcxingji/seal/repository/SealInfoRepository.java`
- **决策**:
  - 使用 Spring Boot 3.2.0
  - 使用 Flyway 管理数据库迁移
  - JPA ddl-auto 设置为 validate，由 Flyway 管理表结构
  - 数据库连接: 60.10.230.150:3306/dianziqian

### #3 - 签章记录表设计 (seal_record)
- **完成时间**: 2026-01-01
- **提交**: `60be46e`
- **类型**: database
- **变更**:
  - 新建:
    - `backend/src/main/resources/db/migration/V2__create_seal_record_table.sql`
    - `backend/src/main/java/cn/tcxingji/seal/entity/SealRecord.java`
    - `backend/src/main/java/cn/tcxingji/seal/repository/SealRecordRepository.java`
- **字段说明**:
  - 合同文件ID、印章ID（关联字段）
  - 盖章位置：页码、X/Y坐标、宽高
  - 签章类型：普通章(1)、骑缝章(2)、个人签名(3)
  - 操作人信息、时间戳

### #4 - 合同文件表设计 (contract_file)
- **完成时间**: 2026-01-01
- **提交**: `8466e72`
- **类型**: database
- **变更**:
  - 新建:
    - `backend/src/main/resources/db/migration/V3__create_contract_file_table.sql`
    - `backend/src/main/java/cn/tcxingji/seal/entity/ContractFile.java`
    - `backend/src/main/java/cn/tcxingji/seal/repository/ContractFileRepository.java`
- **字段说明**:
  - 文件基本信息：文件名、路径、大小、页数、哈希值
  - 签章状态：待签章(0)、签章中(1)、已签章(2)、已作废(3)
  - 所有者信息、备注、时间戳
- **业务方法**:
  - canSign() 判断是否可签章
  - isSigned() 判断是否已签章
  - getFileSizeReadable() 获取可读文件大小格式

### #5 - 个人签名表设计 (personal_signature)
- **完成时间**: 2026-01-01
- **提交**: `b6aa0b1`
- **类型**: database
- **变更**:
  - 新建:
    - `backend/src/main/resources/db/migration/V4__create_personal_signature_table.sql`
    - `backend/src/main/java/cn/tcxingji/seal/entity/PersonalSignature.java`
    - `backend/src/main/java/cn/tcxingji/seal/repository/PersonalSignatureRepository.java`
- **字段说明**:
  - 用户ID、签名名称、签名图片路径
  - 签名类型：上传图片(1)、手写签名(2)、字体生成(3)
  - 字体相关：字体名、颜色、文本内容
  - 是否默认签名、状态
- **业务方法**:
  - isDefaultSignature() 判断是否为默认签名
  - isHandwriting() 判断是否为手写签名
  - isFontGenerated() 判断是否为字体生成签名
  - getSignatureTypeDesc() 获取签名类型描述

## Phase 2: 后端开发 🔄 进行中

### #6 - 印章管理 CRUD API ✅
- **完成时间**: 2026-01-01
- **提交**: `8ca803e`
- **类型**: backend
- **变更**:
  - 新建:
    - `backend/src/main/java/cn/tcxingji/seal/dto/request/SealCreateRequest.java`
    - `backend/src/main/java/cn/tcxingji/seal/dto/request/SealUpdateRequest.java`
    - `backend/src/main/java/cn/tcxingji/seal/dto/request/SealQueryRequest.java`
    - `backend/src/main/java/cn/tcxingji/seal/dto/response/SealResponse.java`
    - `backend/src/main/java/cn/tcxingji/seal/dto/response/ApiResponse.java`
    - `backend/src/main/java/cn/tcxingji/seal/dto/response/PageResponse.java`
    - `backend/src/main/java/cn/tcxingji/seal/service/SealService.java`
    - `backend/src/main/java/cn/tcxingji/seal/service/impl/SealServiceImpl.java`
    - `backend/src/main/java/cn/tcxingji/seal/controller/SealController.java`
    - `backend/src/main/java/cn/tcxingji/seal/exception/BusinessException.java`
    - `backend/src/main/java/cn/tcxingji/seal/exception/GlobalExceptionHandler.java`
  - 修改:
    - `backend/pom.xml` - 添加 Lombok 注解处理器配置
- **API 接口**:
  | 方法 | 路径 | 描述 |
  |------|------|------|
  | GET | /api/seals | 分页查询印章列表 |
  | GET | /api/seals/{id} | 获取印章详情 |
  | POST | /api/seals | 创建印章 |
  | PUT | /api/seals/{id} | 更新印章 |
  | DELETE | /api/seals/{id} | 删除印章 |
  | PUT | /api/seals/{id}/status | 启用/禁用印章 |
  | GET | /api/seals/owner/{ownerId} | 获取所有者印章列表 |
  | GET | /api/seals/owner/{ownerId}/enabled | 获取所有者启用印章 |

## 待执行任务

### Phase 2: 后端开发 (7 个剩余)
- #7 印章图片上传接口 (tc-ready) ⭕
- #8 印章自动生成服务 (tc-ready) ⭕
- #9 PDF 上传与预览接口 (tc-ready) ⭕
- #10 盖章处理接口 (tc-ready) ⭕
- #11 骑缝章生成逻辑 (tc-blocked, 依赖 #10)
- #12 个人签名管理接口 (tc-ready) ⭕
- #13 签名生成接口 (tc-ready) ⭕

### Phase 3: 前端开发 (6 个)
- #14 - #19

### Phase 4: 文档 (1 个)
- #20 API 接口文档

## 数据库表汇总

| 表名 | 用途 | 迁移脚本版本 |
|------|------|-------------|
| seal_info | 印章信息 | V1 |
| seal_record | 签章记录 | V2 |
| contract_file | 合同文件 | V3 |
| personal_signature | 个人签名 | V4 |

## API 接口汇总

| 模块 | 路径前缀 | 状态 |
|------|----------|------|
| 印章管理 | /api/seals | ✅ 已完成 |
