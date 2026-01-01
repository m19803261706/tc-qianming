# 电子签章系统 进度记录

## Epic 进度

🎯 Epic Issue: #1 - 太初星集电子签章系统
进度: ◉◉◉○○○○○○○○○○○○○○○○ 3/19 (16%)

## 已完成任务

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

## 进行中任务

无

## 待执行任务

### Phase 1: 数据库设计 (剩余 1 个)
- #5 个人签名表设计 (tc-ready)

### Phase 2: 后端开发 (8 个)
- #6 印章管理 CRUD API (tc-blocked, 依赖 #2 ✅)
- #7 印章图片上传接口 (tc-blocked, 依赖 #2 ✅)
- #8 印章自动生成服务 (tc-blocked, 依赖 #2 ✅)
- #9 PDF 上传与预览接口 (tc-blocked, 依赖 #4 ✅)
- #10 盖章处理接口 (tc-blocked, 依赖 #2 ✅ #3 ✅ #4 ✅)
- #11 骑缝章生成逻辑 (tc-blocked, 依赖 #10)
- #12 个人签名管理接口 (tc-blocked, 依赖 #5)
- #13 签名生成接口 (tc-blocked, 依赖 #5)

### Phase 3: 前端开发 (6 个)
- #14 - #19

### Phase 4: 文档 (1 个)
- #20 API 接口文档
