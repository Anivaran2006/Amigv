import datetime
import hashlib
from sqlalchemy.orm import Session
from app.models.models import User, Exam, Subscription, Source, Notice, Deadline, NotificationLog
from app.services.change_detector import compute_content_hash

def hash_password(password: str) -> str:
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), b'examalert_salt_2026', 100000).hex()

SAMPLE_EXAMS = [
    {
        "slug": "jee-main",
        "name": "JEE Main 2027",
        "category": "Engineering",
        "organizing_authority": "National Testing Agency (NTA)",
        "official_website": "https://jeemain.nta.nic.in",
        "official_application_url": "https://jeemain.nta.nic.in/registration",
        "description": "National level entrance examination for admission into undergraduate engineering programs at NITs, IIITs, and CFTIs across India."
    },
    {
        "slug": "neet-ug",
        "name": "NEET UG 2027",
        "category": "Medical",
        "organizing_authority": "National Testing Agency (NTA)",
        "official_website": "https://neet.nta.nic.in",
        "official_application_url": "https://neet.nta.nic.in/application",
        "description": "Single all-India entrance examination for admission into undergraduate MBBS, BDS, AYUSH, and veterinary programs."
    },
    {
        "slug": "gate",
        "name": "GATE 2027",
        "category": "Engineering",
        "organizing_authority": "IIT Roorkee / IIT Consortium",
        "official_website": "https://gate2027.iitr.ac.in",
        "official_application_url": "https://goaps.iitr.ac.in",
        "description": "Graduate Aptitude Test in Engineering for postgraduate admissions (M.Tech, Ph.D) and premier PSU recruitments across India."
    },
    {
        "slug": "cat",
        "name": "CAT 2026",
        "category": "MBA",
        "organizing_authority": "Indian Institutes of Management (IIMs)",
        "official_website": "https://iimcat.ac.in",
        "official_application_url": "https://iimcat.ac.in/apply",
        "description": "Premier national entrance test for admission to Master of Business Administration programs across all 21 Indian Institutes of Management."
    },
    {
        "slug": "ssc-cgl",
        "name": "SSC CGL 2026",
        "category": "Government Exams",
        "organizing_authority": "Staff Selection Commission (SSC)",
        "official_website": "https://ssc.gov.in",
        "official_application_url": "https://ssc.gov.in/apply",
        "description": "Combined Graduate Level examination for recruitment to Group 'B' and 'C' non-technical and gazetted posts in Ministries and Departments."
    },
    {
        "slug": "upsc-cse",
        "name": "UPSC Civil Services 2027",
        "category": "Government Exams",
        "organizing_authority": "Union Public Service Commission",
        "official_website": "https://upsc.gov.in",
        "official_application_url": "https://upsconline.nic.in",
        "description": "India's premier civil services examination for recruitment to IAS, IPS, IFS, IRS and allied administrative services."
    },
    {
        "slug": "cuet-ug",
        "name": "CUET UG 2027",
        "category": "University",
        "organizing_authority": "National Testing Agency (NTA)",
        "official_website": "https://exams.nta.ac.in/CUET-UG",
        "official_application_url": "https://cuetug.ntaonline.in",
        "description": "Common University Entrance Test for admission into undergraduate courses across all Central and participating universities in India."
    }
]

def seed_initial_data(db: Session):
    # 1. Seed Exams
    exam_instances = {}
    for ex_data in SAMPLE_EXAMS:
        existing = db.query(Exam).filter(Exam.slug == ex_data["slug"]).first()
        if not existing:
            exam = Exam(
                slug=ex_data["slug"],
                name=ex_data["name"],
                category=ex_data["category"],
                organizing_authority=ex_data["organizing_authority"],
                official_website=ex_data["official_website"],
                official_application_url=ex_data["official_application_url"],
                description=ex_data["description"],
                active=True
            )
            db.add(exam)
            db.flush()
            exam_instances[exam.slug] = exam

            # Add source
            source = Source(
                exam_id=exam.id,
                url=ex_data["official_website"],
                name=f"{ex_data['organizing_authority']} Portal",
                last_scraped_at=datetime.datetime.utcnow(),
                last_content_hash=compute_content_hash(ex_data["name"]),
                status="active"
            )
            db.add(source)
        else:
            exam_instances[existing.slug] = existing

    db.commit()

    # 2. Seed Demo User
    demo_user = db.query(User).filter(User.email == "anivaran@example.com").first()
    if not demo_user:
        hashed = hash_password("password123")
        demo_user = User(
            full_name="Anivaran Sharma",
            email="anivaran@example.com",
            password_hash=hashed,
            phone="+91 9876543210",
            telegram_chat_id="789012345",
            notify_email=True,
            notify_telegram=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # 3. Seed Subscriptions for Demo User
    jee_exam = exam_instances.get("jee-main")
    gate_exam = exam_instances.get("gate")
    cat_exam = exam_instances.get("cat")

    for ex in [jee_exam, gate_exam, cat_exam]:
        if ex:
            sub = db.query(Subscription).filter_by(user_id=demo_user.id, exam_id=ex.id).first()
            if not sub:
                db.add(Subscription(user_id=demo_user.id, exam_id=ex.id, active=True))
    db.commit()

    # 4. Seed Official Notices & Deadlines
    if jee_exam:
        existing_notice = db.query(Notice).filter_by(exam_id=jee_exam.id).first()
        if not existing_notice:
            jee_content = "Inviting Online Applications for Joint Entrance Examination (Main) - 2027 Session 1. The National Testing Agency is conducting the Joint Entrance Examination (Main) – 2027 Session 1. Online submission of Application Form: 20 September to 20 October 2026. Successful fee payment deadline: 20 October 2026 up to 11:50 PM."
            notice = Notice(
                exam_id=jee_exam.id,
                title="Public Notice: Inviting Online Applications for JEE Main 2027 Session 1",
                raw_content=jee_content,
                content_hash=compute_content_hash(jee_content),
                published_date="20 September 2026",
                event_type="REGISTRATION_OPEN",
                importance="high",
                summary="NTA has released the official notification for JEE Main 2027 Session 1. Online application portal is now active for eligible engineering aspirants.",
                registration_start="20 September 2026",
                registration_end="20 October 2026",
                exam_date="22 January to 31 January 2027",
                action_required="Complete online application form and pay prescribed application fee on the official NTA portal before October 20.",
                official_url=jee_exam.official_website,
                is_official=True,
                fees="General/OBC: ₹1000, SC/ST/PwD: ₹500"
            )
            db.add(notice)
            db.flush()

            # Deadline: 20 October 2026
            deadline_dt = datetime.datetime.now() + datetime.timedelta(days=30)
            deadline = Deadline(
                exam_id=jee_exam.id,
                notice_id=notice.id,
                event_name="Session 1 Online Registration",
                deadline_date=deadline_dt,
                is_official=True,
                status="upcoming"
            )
            db.add(deadline)

            # Notification Log for demo user
            notif = NotificationLog(
                user_id=demo_user.id,
                exam_id=jee_exam.id,
                notice_id=notice.id,
                channel="telegram",
                title="🚨 JEE Main 2027 Session 1 Registration Opened",
                message_preview="Online application forms are available from 20 September to 20 October 2026. Complete your application on jeemain.nta.nic.in.",
                status="sent"
            )
            db.add(notif)

            notif_email = NotificationLog(
                user_id=demo_user.id,
                exam_id=jee_exam.id,
                notice_id=notice.id,
                channel="email",
                title="🚨 Official Notice: JEE Main 2027 Session 1 Registration Active",
                message_preview="NTA has officially published the information bulletin and registration link for JEE Main 2027 Session 1.",
                status="sent"
            )
            db.add(notif_email)

    if gate_exam:
        existing_notice = db.query(Notice).filter_by(exam_id=gate_exam.id).first()
        if not existing_notice:
            gate_content = "GATE 2027 Regular Online Registration Window is nearing closure. Candidates must submit their application on GOAPS before 30 September 2026 without late fee."
            notice = Notice(
                exam_id=gate_exam.id,
                title="Important Alert: Regular Registration Deadline Approaching for GATE 2027",
                raw_content=gate_content,
                content_hash=compute_content_hash(gate_content),
                published_date="15 September 2026",
                event_type="REGISTRATION_CLOSING",
                importance="high",
                summary="Candidates are reminded that the regular registration window for GATE 2027 without late fees closes on 30 September 2026.",
                registration_start="28 August 2026",
                registration_end="30 September 2026",
                exam_date="06, 07, 13 and 14 February 2027",
                action_required="Finalize personal, academic details and complete photo/signature uploads on GOAPS portal.",
                official_url=gate_exam.official_website,
                is_official=True
            )
            db.add(notice)
            db.flush()

            deadline_dt = datetime.datetime.now() + datetime.timedelta(days=10)
            deadline = Deadline(
                exam_id=gate_exam.id,
                notice_id=notice.id,
                event_name="Regular Registration (No Late Fee)",
                deadline_date=deadline_dt,
                is_official=True,
                status="urgent"
            )
            db.add(deadline)

            notif = NotificationLog(
                user_id=demo_user.id,
                exam_id=gate_exam.id,
                notice_id=notice.id,
                channel="telegram",
                title="⏰ GATE 2027: Regular Registration Deadline in 10 Days",
                message_preview="Regular registration without late fees closes on 30 September 2026 on the official GOAPS portal.",
                status="sent"
            )
            db.add(notif)

    db.commit()
