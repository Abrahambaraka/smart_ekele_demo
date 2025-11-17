# Diagramme ER - Smart Ekele Database

```mermaid
erDiagram
    users ||--o{ schools : "directs"
    users ||--o{ teachers : "is"
    users ||--o{ students : "is"
    users ||--o{ audit_logs : "performs"
    users ||--o{ attendance : "records"
    users ||--o{ payments : "records"
    users ||--o{ notifications : "sends"
    users ||--o{ notification_recipients : "receives"
    
    schools ||--o{ school_years : "has"
    schools ||--o{ classes : "has"
    schools ||--o{ subjects : "offers"
    schools ||--o{ students : "enrolls"
    schools ||--o{ teachers : "employs"
    schools ||--o{ fees : "defines"
    schools ||--o{ notifications : "sends"
    schools ||--o{ settings : "configures"
    schools ||--o{ audit_logs : "logs"
    
    school_years ||--o{ classes : "organizes"
    school_years ||--o{ teacher_subjects : "assigns"
    school_years ||--o{ grades : "evaluates"
    school_years ||--o{ fees : "charges"
    school_years ||--o{ timetables : "schedules"
    
    classes ||--o{ students : "contains"
    classes ||--o{ teacher_subjects : "teaches"
    classes ||--o{ attendance : "tracks"
    classes ||--o{ grades : "receives"
    classes ||--o{ fees : "applies"
    classes ||--o{ notifications : "notifies"
    classes ||--o{ timetables : "schedules"
    
    subjects ||--o{ teacher_subjects : "taught_by"
    subjects ||--o{ grades : "assessed_in"
    subjects ||--o{ timetables : "scheduled"
    
    teachers ||--o{ teacher_subjects : "teaches"
    teachers ||--o{ grades : "evaluates"
    teachers ||--o{ timetables : "assigned"
    
    students ||--o{ attendance : "attends"
    students ||--o{ grades : "scores"
    students ||--o{ payments : "pays"
    
    fees ||--o{ payments : "paid_via"
    
    notifications ||--o{ notification_recipients : "sent_to"
    
    users {
        varchar id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar phone
        enum role
        varchar profile_image
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp last_login
    }
    
    schools {
        varchar id PK
        varchar name
        varchar code UK
        text address
        varchar city
        varchar province
        varchar country
        varchar phone
        varchar email
        varchar logo
        varchar director_id FK
        enum subscription_plan
        date subscription_start_date
        date subscription_end_date
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    school_years {
        varchar id PK
        varchar school_id FK
        varchar name
        date start_date
        date end_date
        boolean is_current
        timestamp created_at
        timestamp updated_at
    }
    
    classes {
        varchar id PK
        varchar school_id FK
        varchar name
        varchar level
        varchar section
        int capacity
        varchar school_year_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    subjects {
        varchar id PK
        varchar school_id FK
        varchar name
        varchar code
        text description
        decimal coefficient
        timestamp created_at
        timestamp updated_at
    }
    
    students {
        varchar id PK
        varchar user_id FK
        varchar school_id FK
        varchar student_number UK
        varchar first_name
        varchar last_name
        date date_of_birth
        enum gender
        text address
        varchar city
        varchar phone
        varchar email
        varchar parent_name
        varchar parent_phone
        varchar parent_email
        varchar class_id FK
        date enrollment_date
        enum status
        text medical_info
        varchar emergency_contact
        varchar emergency_phone
        varchar photo
        timestamp created_at
        timestamp updated_at
    }
    
    teachers {
        varchar id PK
        varchar user_id FK
        varchar school_id FK
        varchar teacher_number UK
        varchar qualification
        varchar specialization
        date hire_date
        decimal salary
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    teacher_subjects {
        varchar id PK
        varchar teacher_id FK
        varchar subject_id FK
        varchar class_id FK
        varchar school_year_id FK
        timestamp created_at
    }
    
    attendance {
        varchar id PK
        varchar student_id FK
        varchar class_id FK
        date date
        enum status
        text remarks
        varchar recorded_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    grades {
        varchar id PK
        varchar student_id FK
        varchar subject_id FK
        varchar class_id FK
        varchar school_year_id FK
        enum exam_type
        decimal score
        decimal max_score
        date exam_date
        text remarks
        varchar teacher_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    fees {
        varchar id PK
        varchar school_id FK
        varchar name
        text description
        decimal amount
        enum fee_type
        varchar class_id FK
        varchar school_year_id FK
        boolean is_mandatory
        timestamp created_at
        timestamp updated_at
    }
    
    payments {
        varchar id PK
        varchar student_id FK
        varchar fee_id FK
        decimal amount_paid
        date payment_date
        enum payment_method
        varchar reference_number
        enum status
        text remarks
        varchar recorded_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    notifications {
        varchar id PK
        varchar school_id FK
        varchar title
        text message
        enum type
        enum target_audience
        varchar class_id FK
        enum priority
        boolean is_read
        varchar sent_by FK
        timestamp created_at
    }
    
    notification_recipients {
        varchar id PK
        varchar notification_id FK
        varchar user_id FK
        boolean is_read
        timestamp read_at
        timestamp created_at
    }
    
    timetables {
        varchar id PK
        varchar class_id FK
        varchar subject_id FK
        varchar teacher_id FK
        enum day_of_week
        time start_time
        time end_time
        varchar room
        varchar school_year_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    audit_logs {
        varchar id PK
        varchar user_id FK
        varchar school_id FK
        varchar action
        varchar table_name
        varchar record_id
        json old_values
        json new_values
        varchar ip_address
        text user_agent
        timestamp created_at
    }
    
    settings {
        varchar id PK
        varchar school_id FK
        varchar setting_key
        text setting_value
        enum data_type
        text description
        timestamp created_at
        timestamp updated_at
    }
```

## Relations principales

### Hiérarchie des utilisateurs
- **users** (table centrale pour tous les utilisateurs)
  - School Director (gère une école)
  - Teacher (enseigne dans une école)

### Structure académique
- **schools** → **school_years** → **classes** → **students**
- **schools** → **subjects**
- **teachers** ↔ **subjects** ↔ **classes** (via teacher_subjects)

### Gestion académique
- **students** → **attendance** (présences)
- **students** → **grades** (notes)
- **classes** → **timetables** (emplois du temps)

### Gestion financière
- **schools** → **fees** (définition des frais)
- **students** → **payments** (paiements effectués)
- **fees** ↔ **payments**

### Communication
- **notifications** (envoyées par l'école)
- **notification_recipients** (destinataires individuels)

### Sécurité et audit
- **audit_logs** (traçabilité de toutes les actions)
- **settings** (paramètres configurables par école)
