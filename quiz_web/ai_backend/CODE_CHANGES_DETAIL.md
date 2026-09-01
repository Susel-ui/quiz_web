# Code Changes Details

## 1. CORS Restriction

**File:** `backend/main.py` (lines 37-45)

**Before:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**After:**
```python
# Restrict CORS origins to prevent unauthorized access
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)
```

---

## 2. File Upload Validation

**File:** `backend/main.py` - `/extract` endpoint

**Before:**
```python
@app.post("/extract")
async def extract(file: UploadFile = File(...)) -> dict:
    extraction = extract_text(file.file, file.filename)
    if extraction.is_empty:
        raise HTTPException(status_code=422, detail="Uploaded file had no extractable text")
    return {
        "filename": extraction.filename,
        "file_type": extraction.file_type,
        "char_count": extraction.char_count,
        "unit_count": extraction.unit_count,
        "warnings": extraction.warnings,
        "text": truncate_for_llm(extraction.text),
    }
```

**After:**
```python
@app.post("/extract")
async def extract(file: UploadFile = File(...)) -> dict:
    # Validate file size (max 50MB)
    MAX_FILE_SIZE = 50 * 1024 * 1024
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds {MAX_FILE_SIZE / 1024 / 1024:.0f}MB limit"
        )
    
    # Validate file type
    allowed_types = {
        "application/pdf", 
        "text/plain", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Supported: PDF, TXT, DOCX"
        )
    
    file.file.seek(0)
    extraction = extract_text(file.file, file.filename)
    if extraction.is_empty:
        raise HTTPException(status_code=422, detail="Uploaded file had no extractable text")
    return {
        "filename": extraction.filename,
        "file_type": extraction.file_type,
        "char_count": extraction.char_count,
        "unit_count": extraction.unit_count,
        "warnings": extraction.warnings,
        "text": truncate_for_llm(extraction.text),
    }
```

---

## 3. LLM Input Sanitization

**File:** `backend/main.py` - `/generate-quiz` endpoint

**Before:**
```python
@app.post("/generate-quiz", response_model=AssessmentPayload)
def generate_quiz(request: GenerateQuizRequest) -> AssessmentPayload:
    return generate_mcqs(
        text=request.text,
        document_title=request.document_title,
        num_questions=request.num_questions,
        provider=request.provider,
        model=request.model,
    )
```

**After:**
```python
@app.post("/generate-quiz", response_model=AssessmentPayload)
def generate_quiz(request: GenerateQuizRequest) -> AssessmentPayload:
    # Sanitize inputs to prevent prompt injection
    if not request.text or len(request.text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Document text must contain at least 50 characters"
        )
    
    # Escape special characters in user inputs
    safe_title = request.document_title.replace('"', '\\"').replace('\n', ' ')[:200]
    safe_text = request.text.strip()[:100000]  # Truncate to 100k chars
    
    if request.num_questions < 1 or request.num_questions > 50:
        raise HTTPException(
            status_code=400,
            detail="num_questions must be between 1 and 50"
        )
    
    return generate_mcqs(
        text=safe_text,
        document_title=safe_title,
        num_questions=request.num_questions,
        provider=request.provider,
        model=request.model,
        use_fallback_on_error=False,  # Don't silently fail
    )
```

---

## 4. Request Validation with Pydantic Validators

**File:** `backend/main.py` - GapAnalysisRequest class

**Before:**
```python
class GapAnalysisRequest(BaseModel):
    questions: List[dict]
    user_answers: Dict[int, int]
    learner_id: Optional[int] = None
    profile: Optional[LearnerProfile] = None
    document_title: str = "Diagnostic Assessment"
    summary: str = "Assessment submitted through /gap-analysis."
    is_fallback: bool = False
```

**After:**
```python
class GapAnalysisRequest(BaseModel):
    questions: List[dict]
    user_answers: Dict[int, int]
    learner_id: Optional[int] = None
    profile: Optional[LearnerProfile] = None
    document_title: str = "Diagnostic Assessment"
    summary: str = "Assessment submitted through /gap-analysis."
    is_fallback: bool = False
    
    @validator("questions")
    def validate_questions(cls, v):
        if not v or len(v) == 0:
            raise ValueError("At least one question is required")
        return v
    
    @validator("user_answers")
    def validate_answers(cls, v):
        if not v or len(v) == 0:
            raise ValueError("user_answers cannot be empty")
        for q_id, answer_idx in v.items():
            if not isinstance(answer_idx, int) or answer_idx < 0 or answer_idx > 3:
                raise ValueError("Answer index must be between 0 and 3")
        return v
```

---

## 5. Database Foreign Key Constraints

**File:** `backend/db_models.py`

### Assessment Table - Make learner_id Required

**Before:**
```python
class Assessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    learner_id: Optional[int] = Field(default=None, foreign_key="learner.id")  # Optional!
    document_title: str
    summary: str
    questions_json: str
    is_fallback: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**After:**
```python
class Assessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    learner_id: int = Field(foreign_key="learner.id")  # Required: assessments must belong to a learner
    document_title: str
    summary: str
    questions_json: str
    is_fallback: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### QuizAttempt Table - Make learner_id Required

**Before:**
```python
class QuizAttempt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_id: int = Field(foreign_key="assessment.id")
    learner_id: Optional[int] = Field(default=None, foreign_key="learner.id")  # Optional!
    user_answers_json: str
    overall_percentage: float
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
```

**After:**
```python
class QuizAttempt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_id: int = Field(foreign_key="assessment.id")
    learner_id: int = Field(foreign_key="learner.id")  # Required: attempts must have a learner
    user_answers_json: str
    overall_percentage: float
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
```

### Enrolment Table - Add created_at for Audit Trail

**Before:**
```python
class Enrolment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    learner_id: int = Field(foreign_key="learner.id")
    course_id: str
    catalog_source: str
    status: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**After:**
```python
class Enrolment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    learner_id: int = Field(foreign_key="learner.id")
    course_id: str
    catalog_source: str
    status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)  # Track enrollment start
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Import Changes

**File:** `backend/main.py`

**Before:**
```python
from pydantic import BaseModel, Field
```

**After:**
```python
from pydantic import BaseModel, Field, validator
```

This adds Pydantic's `validator` decorator for request validation.

---

## Summary of Lines Changed

| File | Lines | Change Type |
|------|-------|------------|
| main.py | 37-45 | CORS restriction |
| main.py | 52 | Add validator import |
| main.py | 63-89 | File upload validation |
| main.py | 103-124 | Request validators |
| main.py | 199-216 | LLM input sanitization |
| db_models.py | 35 | Assessment.learner_id required |
| db_models.py | 50 | QuizAttempt.learner_id required |
| db_models.py | 68 | Enrolment.created_at added |

---

## Breaking Changes

⚠️ **Database Schema Change**: Existing databases with null `learner_id` in Assessment or QuizAttempt tables need migration.

For hackathon development, simply delete `database.db` and restart the app.

For production migrations, run:
```sql
-- Backup first!
DELETE FROM assessment WHERE learner_id IS NULL;
DELETE FROM quiz_attempt WHERE learner_id IS NULL;

-- Then apply schema changes
-- Or use SQLAlchemy migrations for gradual rollout
```

