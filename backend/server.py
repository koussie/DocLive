import math
import os
import uuid
from datetime import datetime, timezone, timedelta, date, time
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(ROOT_DIR, ".env"))

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="DocLive API")
api = APIRouter(prefix="/api")

DEMO_PATIENT_ID = "demo-patient"


def now_utc():
    return datetime.now(timezone.utc)


def haversine_km(lat1, lng1, lat2, lng2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.asin(math.sqrt(a)), 1)


# ----------------------------- Models -----------------------------
class SlotBookRequest(BaseModel):
    doctor_id: str
    date: str  # YYYY-MM-DD
    time: str  # HH:mm
    motif: str
    type: str = "cabinet"  # cabinet | teleconsultation
    # patient info (non RAMQ)
    patient_name: str
    patient_email: str
    patient_phone: Optional[str] = None
    permit_type: Optional[str] = None
    insurer: Optional[str] = None
    policy_number: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    birthdate: Optional[str] = None
    nationality: Optional[str] = None
    permit_type: Optional[str] = None
    passport_number: Optional[str] = None
    insurer: Optional[str] = None
    policy_number: Optional[str] = None
    coverage: Optional[str] = None


# ----------------------------- Seed data -----------------------------
DOCTORS_SEED = [
    {
        "id": "doc-amelie-tremblay",
        "lat": 45.5245,
        "lng": -73.5795,
        "license": {"number": "1-12345-6", "registry": "Collège des médecins du Québec", "status": "Actif", "verified_at": "2026-06-01", "registry_url": "https://www.cmq.org/fr/bottin"},
        "nom": "Dre Amélie Tremblay",
        "specialty": "Médecine générale",
        "specialty_group": "Médecine générale",
        "city": "Montréal",
        "neighborhood": "Plateau Mont-Royal",
        "address": "245 avenue du Mont-Royal Est, Montréal, QC",
        "languages": ["Français", "Anglais"],
        "photo": "https://images.pexels.com/photos/38618420/pexels-photo-38618420.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "price": 90,
        "accepts_without_ramq": True,
        "teleconsultation": True,
        "rating": 4.9,
        "reviews_count": 214,
        "insurances": ["Croix Bleue", "Sun Life", "Desjardins", "Guard.me"],
        "bio": "Médecin de famille depuis 12 ans, la Dre Tremblay accompagne les nouveaux arrivants et étudiants internationaux avec une approche humaine et sans jugement.",
        "education": ["Doctorat en médecine, Université de Montréal", "Résidence en médecine familiale, CHUM"],
        "acts": ["Consultation générale", "Renouvellement d'ordonnance", "Certificat médical", "Vaccination"],
    },
    {
        "id": "doc-karim-benali",
        "lat": 45.504,
        "lng": -73.576,
        "license": {"number": "1-23456-7", "registry": "Collège des médecins du Québec", "status": "Actif", "verified_at": "2026-06-01", "registry_url": "https://www.cmq.org/fr/bottin"},
        "nom": "Dr Karim Benali",
        "specialty": "Médecine générale",
        "specialty_group": "Médecine générale",
        "city": "Montréal",
        "neighborhood": "Centre-ville",
        "address": "1010 rue Sherbrooke Ouest, Montréal, QC",
        "languages": ["Français", "Anglais", "Arabe"],
        "photo": "https://images.pexels.com/photos/32254658/pexels-photo-32254658.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "price": 85,
        "accepts_without_ramq": True,
        "teleconsultation": True,
        "rating": 4.8,
        "reviews_count": 168,
        "insurances": ["Allianz", "MSH", "Guard.me", "Sun Life"],
        "bio": "Le Dr Benali se spécialise dans le suivi des travailleurs temporaires. Il parle couramment l'arabe et facilite les démarches d'assurance privée.",
        "education": ["Doctorat en médecine, Université McGill", "Formation en médecine du travail"],
        "acts": ["Consultation générale", "Bilan de santé", "Examen d'embauche", "Téléconsultation"],
    },
    {
        "id": "doc-sophie-nguyen",
        "lat": 45.56,
        "lng": -73.747,
        "license": {"number": "1-34567-8", "registry": "Collège des médecins du Québec", "status": "Actif", "verified_at": "2026-06-01", "registry_url": "https://www.cmq.org/fr/bottin"},
        "nom": "Dre Sophie Nguyen",
        "specialty": "Pédiatrie",
        "specialty_group": "Pédiatrie",
        "city": "Laval",
        "neighborhood": "Chomedey",
        "address": "3200 boulevard Saint-Martin Ouest, Laval, QC",
        "languages": ["Français", "Anglais", "Mandarin"],
        "photo": "https://images.pexels.com/photos/6749777/pexels-photo-6749777.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "price": 110,
        "accepts_without_ramq": True,
        "teleconsultation": False,
        "rating": 5.0,
        "reviews_count": 97,
        "insurances": ["Croix Bleue", "Desjardins", "Guard.me"],
        "bio": "Pédiatre attentionnée, la Dre Nguyen prend en charge les enfants de familles immigrantes et explique chaque étape avec patience.",
        "education": ["Doctorat en médecine, Université Laval", "Spécialisation en pédiatrie, CHU Sainte-Justine"],
        "acts": ["Suivi de l'enfant", "Vaccination pédiatrique", "Consultation nourrisson"],
    },
    {
        "id": "doc-marc-lefebvre",
        "lat": 46.78,
        "lng": -71.283,
        "license": {"number": "1-45678-9", "registry": "Collège des médecins du Québec", "status": "Actif", "verified_at": "2026-06-01", "registry_url": "https://www.cmq.org/fr/bottin"},
        "nom": "Dr Marc Lefebvre",
        "specialty": "Dermatologie",
        "specialty_group": "Dermatologie",
        "city": "Québec",
        "neighborhood": "Sainte-Foy",
        "address": "2600 boulevard Laurier, Québec, QC",
        "languages": ["Français", "Anglais"],
        "photo": "https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
        "price": 140,
        "accepts_without_ramq": True,
        "teleconsultation": True,
        "rating": 4.7,
        "reviews_count": 132,
        "insurances": ["Sun Life", "Allianz", "MSH"],
        "bio": "Dermatologue reconnu, le Dr Lefebvre traite les affections de la peau avec des équipements de pointe et un service en clinique privée.",
        "education": ["Doctorat en médecine, Université Laval", "Fellowship en dermatologie clinique"],
        "acts": ["Consultation dermatologique", "Dépistage grain de beauté", "Traitement acné"],
    },
    {
        "id": "doc-fatima-el-amrani",
        "lat": 45.495,
        "lng": -73.625,
        "license": {"number": "1-56789-0", "registry": "Collège des médecins du Québec", "status": "Actif", "verified_at": "2026-06-01", "registry_url": "https://www.cmq.org/fr/bottin"},
        "nom": "Dre Fatima El Amrani",
        "specialty": "Gynécologie",
        "specialty_group": "Gynécologie",
        "city": "Montréal",
        "neighborhood": "Côte-des-Neiges",
        "address": "5450 chemin de la Côte-des-Neiges, Montréal, QC",
        "languages": ["Français", "Anglais", "Arabe", "Espagnol"],
        "photo": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
        "price": 130,
        "accepts_without_ramq": True,
        "teleconsultation": True,
        "rating": 4.9,
        "reviews_count": 156,
        "insurances": ["Croix Bleue", "Sun Life", "MSH", "Guard.me"],
        "bio": "La Dre El Amrani offre un suivi gynécologique bienveillant et confidentiel, adapté aux femmes récemment arrivées au Québec.",
        "education": ["Doctorat en médecine, Université de Montréal", "Spécialisation en gynécologie obstétrique"],
        "acts": ["Suivi gynécologique", "Contraception", "Dépistage", "Téléconsultation"],
    },
    {
        "id": "doc-julien-gagnon",
        "lat": 45.401,
        "lng": -71.892,
        "license": {"number": "1-67890-1", "registry": "Collège des médecins du Québec", "status": "Actif", "verified_at": "2026-06-01", "registry_url": "https://www.cmq.org/fr/bottin"},
        "nom": "Dr Julien Gagnon",
        "specialty": "Santé mentale",
        "specialty_group": "Santé mentale",
        "city": "Sherbrooke",
        "neighborhood": "Centre-ville",
        "address": "150 rue King Ouest, Sherbrooke, QC",
        "languages": ["Français", "Anglais"],
        "photo": "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "price": 120,
        "accepts_without_ramq": True,
        "teleconsultation": True,
        "rating": 4.8,
        "reviews_count": 88,
        "insurances": ["Desjardins", "Sun Life", "Guard.me", "Allianz"],
        "bio": "Psychologue clinicien, le Dr Gagnon aide les étudiants étrangers à gérer le stress, l'adaptation culturelle et l'anxiété.",
        "education": ["Doctorat en psychologie, Université de Sherbrooke"],
        "acts": ["Consultation en santé mentale", "Gestion du stress", "Suivi psychologique"],
    },
    {
        "id": "doc-elena-rossi",
        "lat": 45.529,
        "lng": -73.612,
        "license": {"number": "1-78901-2", "registry": "Collège des médecins du Québec", "status": "Actif", "verified_at": "2026-06-01", "registry_url": "https://www.cmq.org/fr/bottin"},
        "nom": "Dre Elena Rossi",
        "specialty": "Médecine générale",
        "specialty_group": "Médecine générale",
        "city": "Montréal",
        "neighborhood": "Petite-Italie",
        "address": "6900 boulevard Saint-Laurent, Montréal, QC",
        "languages": ["Français", "Anglais", "Italien", "Espagnol"],
        "photo": "https://images.pexels.com/photos/6749773/pexels-photo-6749773.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "price": 80,
        "accepts_without_ramq": True,
        "teleconsultation": True,
        "rating": 4.9,
        "reviews_count": 203,
        "insurances": ["Croix Bleue", "Allianz", "MSH", "Guard.me", "Sun Life"],
        "bio": "Spécialiste de la téléconsultation, la Dre Rossi offre des rendez-vous rapides en ligne, idéals pour un emploi du temps chargé.",
        "education": ["Doctorat en médecine, Université McGill"],
        "acts": ["Téléconsultation", "Renouvellement d'ordonnance", "Consultation générale"],
    },
    {
        "id": "doc-david-chen",
        "lat": 45.535,
        "lng": -73.512,
        "license": {"number": "1-89012-3", "registry": "Collège des médecins du Québec", "status": "Actif", "verified_at": "2026-06-01", "registry_url": "https://www.cmq.org/fr/bottin"},
        "nom": "Dr David Chen",
        "specialty": "Dentisterie",
        "specialty_group": "Dentisterie",
        "city": "Longueuil",
        "neighborhood": "Vieux-Longueuil",
        "address": "255 rue Saint-Charles Ouest, Longueuil, QC",
        "languages": ["Français", "Anglais", "Mandarin"],
        "photo": "https://images.pexels.com/photos/28516276/pexels-photo-28516276.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "price": 100,
        "accepts_without_ramq": True,
        "teleconsultation": False,
        "rating": 4.7,
        "reviews_count": 121,
        "insurances": ["Sun Life", "Desjardins", "Croix Bleue"],
        "bio": "Dentiste généraliste, le Dr Chen propose des soins dentaires accessibles avec facturation directe aux assurances privées.",
        "education": ["Doctorat en médecine dentaire, Université de Montréal"],
        "acts": ["Examen dentaire", "Nettoyage", "Traitement de carie", "Urgence dentaire"],
    },
]

TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
              "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]

JOURS_FR = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."]
MOIS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
           "juill.", "août", "sept.", "oct.", "nov.", "déc."]


def label_fr(day):
    return f"{JOURS_FR[day.weekday()]} {day.day} {MOIS_FR[day.month - 1]}"


def build_availability(doctor_id: str, booked: set):
    """Deterministic availability for the next 7 days, minus booked slots."""
    seed_int = sum(ord(c) for c in doctor_id)
    days = []
    today = datetime.now(timezone.utc).date()
    for d in range(7):
        day = today + timedelta(days=d)
        if day.weekday() == 6:  # closed Sunday
            continue
        slots = []
        for i, t in enumerate(TIME_SLOTS):
            # deterministic pseudo-availability pattern
            available = ((seed_int + d * 7 + i * 3) % 5) != 0
            key = f"{doctor_id}|{day.isoformat()}|{t}"
            if key in booked:
                available = False
            slots.append({"time": t, "available": available})
        days.append({"date": day.isoformat(), "label": label_fr(day), "slots": slots})
    return days


CONSULTATIONS_SEED = [
    {
        "id": "cons-1",
        "patient_id": DEMO_PATIENT_ID,
        "doctor_id": "doc-amelie-tremblay",
        "doctor_name": "Dre Amélie Tremblay",
        "specialty": "Médecine générale",
        "date": (datetime.now(timezone.utc).date() - timedelta(days=42)).isoformat(),
        "motif": "Bilan de santé annuel",
        "diagnosis": "État de santé général satisfaisant. Légère carence en vitamine D.",
        "prescription": "Vitamine D 1000 UI, une prise par jour pendant 3 mois.",
        "notes": "Contrôle recommandé dans 6 mois. Encourager activité physique régulière.",
        "receipt_amount": 90,
        "receipt_available": True,
    },
    {
        "id": "cons-2",
        "patient_id": DEMO_PATIENT_ID,
        "doctor_id": "doc-marc-lefebvre",
        "doctor_name": "Dr Marc Lefebvre",
        "specialty": "Dermatologie",
        "date": (datetime.now(timezone.utc).date() - timedelta(days=20)).isoformat(),
        "motif": "Consultation dermatologique, éruption cutanée",
        "diagnosis": "Dermatite de contact bénigne.",
        "prescription": "Crème à base d'hydrocortisone 1%, application deux fois par jour.",
        "notes": "Éviter les savons parfumés. Reçu transmis pour remboursement assurance.",
        "receipt_amount": 140,
        "receipt_available": True,
    },
    {
        "id": "cons-3",
        "patient_id": DEMO_PATIENT_ID,
        "doctor_id": "doc-elena-rossi",
        "doctor_name": "Dre Elena Rossi",
        "specialty": "Médecine générale",
        "date": (datetime.now(timezone.utc).date() - timedelta(days=6)).isoformat(),
        "motif": "Téléconsultation, symptômes grippaux",
        "diagnosis": "Infection virale des voies respiratoires supérieures.",
        "prescription": "Repos, hydratation, acétaminophène au besoin.",
        "notes": "Reprise du travail conseillée après 48 heures sans fièvre.",
        "receipt_amount": 80,
        "receipt_available": True,
    },
]

PROFILE_SEED = {
    "id": DEMO_PATIENT_ID,
    "name": "Maria Gonzalez",
    "email": "maria.gonzalez@example.com",
    "phone": "+1 514 555 0199",
    "birthdate": "1998-05-14",
    "nationality": "Mexicaine",
    "permit_type": "Permis d'études",
    "passport_number": "G12345678",
    "insurer": "Guard.me",
    "policy_number": "GM-2024-778452",
    "coverage": "Assurance santé étudiante internationale, couverture consultation et médicaments jusqu'à 90%.",
}


async def seed():
    if await db.doctors.count_documents({}) == 0:
        await db.doctors.insert_many([dict(d) for d in DOCTORS_SEED])
    if await db.consultations.count_documents({}) == 0:
        await db.consultations.insert_many([dict(c) for c in CONSULTATIONS_SEED])
    if await db.profiles.count_documents({"id": DEMO_PATIENT_ID}) == 0:
        await db.profiles.insert_one(dict(PROFILE_SEED))


@app.on_event("startup")
async def on_startup():
    await seed()


# ----------------------------- Routes -----------------------------
@api.get("/")
async def root():
    return {"service": "DocLive API", "status": "ok"}


@api.get("/facets")
async def facets():
    specialties = sorted({d["specialty"] for d in DOCTORS_SEED})
    cities = sorted({d["city"] for d in DOCTORS_SEED})
    languages = sorted({l for d in DOCTORS_SEED for l in d["languages"]})
    insurances = sorted({i for d in DOCTORS_SEED for i in d["insurances"]})
    return {
        "specialties": specialties,
        "cities": cities,
        "languages": languages,
        "insurances": insurances + ["Sans assurance (paiement direct)"],
    }


async def _booked_slots(doctor_id: str) -> set:
    booked = set()
    cursor = db.appointments.find({"doctor_id": doctor_id, "status": {"$ne": "CANCELLED"}})
    async for a in cursor:
        booked.add(f"{doctor_id}|{a['date']}|{a['time']}")
    return booked


@api.get("/doctors")
async def list_doctors(
    specialty: Optional[str] = None,
    city: Optional[str] = None,
    language: Optional[str] = None,
    insurance: Optional[str] = None,
    teleconsultation: Optional[bool] = None,
    q: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    sort: Optional[str] = None,
    max_km: Optional[float] = None,
):
    results = []
    for d in DOCTORS_SEED:
        if specialty and d["specialty"] != specialty:
            continue
        if city and d["city"] != city:
            continue
        if language and language not in d["languages"]:
            continue
        if insurance and not insurance.startswith("Sans assurance") and insurance not in d["insurances"]:
            continue
        if teleconsultation and not d["teleconsultation"]:
            continue
        if q:
            hay = f"{d['nom']} {d['specialty']} {d['city']} {d['neighborhood']}".lower()
            if q.lower() not in hay:
                continue
        item = dict(d)
        if lat is not None and lng is not None:
            item["distance_km"] = haversine_km(lat, lng, d["lat"], d["lng"])
            if max_km is not None and item["distance_km"] > max_km:
                continue
        booked = await _booked_slots(d["id"])
        item["availability"] = build_availability(d["id"], booked)
        results.append(item)
    if sort == "distance" and lat is not None and lng is not None:
        results.sort(key=lambda x: x["distance_km"])
    elif sort == "price":
        results.sort(key=lambda x: x["price"])
    elif sort == "rating":
        results.sort(key=lambda x: -x["rating"])
    return {"count": len(results), "doctors": results}


@api.get("/doctors/{doctor_id}/license")
async def verify_license(doctor_id: str):
    d = next((x for x in DOCTORS_SEED if x["id"] == doctor_id), None)
    if not d:
        raise HTTPException(status_code=404, detail="Médecin introuvable")
    lic = d["license"]
    return {
        "doctor_id": doctor_id,
        "doctor_name": d["nom"],
        "verified": lic["status"] == "Actif",
        "checked_at": now_utc().isoformat(),
        **lic,
    }


@api.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    d = next((x for x in DOCTORS_SEED if x["id"] == doctor_id), None)
    if not d:
        raise HTTPException(status_code=404, detail="Médecin introuvable")
    booked = await _booked_slots(doctor_id)
    item = dict(d)
    item["availability"] = build_availability(doctor_id, booked)
    return item


@api.post("/appointments")
async def create_appointment(req: SlotBookRequest):
    d = next((x for x in DOCTORS_SEED if x["id"] == req.doctor_id), None)
    if not d:
        raise HTTPException(status_code=404, detail="Médecin introuvable")
    existing = await db.appointments.find_one({
        "doctor_id": req.doctor_id, "date": req.date, "time": req.time,
        "status": {"$ne": "CANCELLED"},
    })
    if existing:
        raise HTTPException(status_code=409, detail="Ce créneau vient d'être réservé, veuillez en choisir un autre.")
    appt = {
        "id": str(uuid.uuid4()),
        "patient_id": DEMO_PATIENT_ID,
        "doctor_id": req.doctor_id,
        "doctor_name": d["nom"],
        "doctor_photo": d["photo"],
        "specialty": d["specialty"],
        "address": d["address"],
        "city": d["city"],
        "date": req.date,
        "time": req.time,
        "motif": req.motif,
        "type": req.type,
        "price": d["price"],
        "status": "CONFIRMED",
        "patient_name": req.patient_name,
        "patient_email": req.patient_email,
        "patient_phone": req.patient_phone,
        "permit_type": req.permit_type,
        "insurer": req.insurer,
        "policy_number": req.policy_number,
        "created_at": now_utc().isoformat(),
    }
    await db.appointments.insert_one(dict(appt))
    appt.pop("_id", None)
    return appt


@api.get("/appointments")
async def list_appointments():
    items = []
    cursor = db.appointments.find({"patient_id": DEMO_PATIENT_ID}).sort("created_at", -1)
    async for a in cursor:
        a.pop("_id", None)
        items.append(a)
    # split upcoming/past
    today = datetime.now(timezone.utc).date().isoformat()
    upcoming = [a for a in items if a["status"] != "CANCELLED" and a["date"] >= today]
    upcoming.sort(key=lambda x: (x["date"], x["time"]))
    others = [a for a in items if a not in upcoming]
    return {"upcoming": upcoming, "history": others}


@api.put("/appointments/{appt_id}/cancel")
async def cancel_appointment(appt_id: str):
    res = await db.appointments.find_one({"id": appt_id})
    if not res:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
    await db.appointments.update_one(
        {"id": appt_id},
        {"$set": {"status": "CANCELLED", "canceled_at": now_utc().isoformat()}},
    )
    res = await db.appointments.find_one({"id": appt_id})
    res.pop("_id", None)
    return res


@api.get("/consultations")
async def list_consultations():
    items = []
    cursor = db.consultations.find({"patient_id": DEMO_PATIENT_ID}).sort("date", -1)
    async for c in cursor:
        c.pop("_id", None)
        items.append(c)
    return {"consultations": items}


def build_receipt_pdf(c: dict, patient: dict, doctor: dict) -> bytes:
    from io import BytesIO
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    buf = BytesIO()
    pdf = canvas.Canvas(buf, pagesize=LETTER)
    w, h = LETTER
    brand = colors.HexColor("#1D4ED8")
    ink = colors.HexColor("#0F172A")
    muted = colors.HexColor("#64748B")

    pdf.setFillColor(brand)
    pdf.rect(0, h - 28 * mm, w, 28 * mm, stroke=0, fill=1)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(20 * mm, h - 17 * mm, "DocLive")
    pdf.setFont("Helvetica", 10)
    pdf.drawRightString(w - 20 * mm, h - 17 * mm, "Reçu officiel de consultation médicale")

    y = h - 45 * mm
    pdf.setFillColor(ink)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(20 * mm, y, f"Reçu no {c['id'].upper()}")
    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(muted)
    pdf.drawRightString(w - 20 * mm, y, f"Émis le {datetime.now(timezone.utc).date().isoformat()}")

    def block(title, rows, top):
        pdf.setFillColor(brand)
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(20 * mm, top, title)
        pdf.setStrokeColor(colors.HexColor("#E2E8F0"))
        pdf.line(20 * mm, top - 2 * mm, w - 20 * mm, top - 2 * mm)
        yy = top - 8 * mm
        for label, value in rows:
            pdf.setFillColor(muted)
            pdf.setFont("Helvetica", 9.5)
            pdf.drawString(20 * mm, yy, label)
            pdf.setFillColor(ink)
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(70 * mm, yy, str(value or "Non renseigné"))
            yy -= 6.5 * mm
        return yy - 6 * mm

    y = block("Patient", [
        ("Nom", patient.get("name")),
        ("Courriel", patient.get("email")),
        ("Nationalité", patient.get("nationality")),
        ("Passeport", patient.get("passport_number")),
        ("Statut", patient.get("permit_type")),
        ("Assureur", patient.get("insurer")),
        ("Numéro de police", patient.get("policy_number")),
    ], y - 14 * mm)

    y = block("Professionnel de santé", [
        ("Médecin", c.get("doctor_name")),
        ("Spécialité", c.get("specialty")),
        ("Adresse", doctor.get("address")),
    ], y)

    y = block("Consultation", [
        ("Date", c.get("date")),
        ("Motif", c.get("motif")),
        ("Diagnostic", c.get("diagnosis")),
    ], y)

    pdf.setFillColor(colors.HexColor("#F1F5F9"))
    pdf.roundRect(20 * mm, y - 18 * mm, w - 40 * mm, 16 * mm, 3 * mm, stroke=0, fill=1)
    pdf.setFillColor(ink)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(26 * mm, y - 11.5 * mm, "Montant total payé")
    pdf.setFillColor(brand)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawRightString(w - 26 * mm, y - 12 * mm, f"{c.get('receipt_amount', 0):.2f} $ CA")

    pdf.setFillColor(muted)
    pdf.setFont("Helvetica", 8.5)
    pdf.drawString(20 * mm, 22 * mm, "Consultation non couverte par la RAMQ. Ce reçu peut être soumis à votre assureur privé pour remboursement.")
    pdf.drawString(20 * mm, 17 * mm, "DocLive, plateforme de prise de rendez-vous médical au Québec.")
    pdf.showPage()
    pdf.save()
    return buf.getvalue()


@api.get("/consultations/{cons_id}/receipt")
async def consultation_receipt(cons_id: str):
    c = await db.consultations.find_one({"id": cons_id, "patient_id": DEMO_PATIENT_ID})
    if not c or not c.get("receipt_available"):
        raise HTTPException(status_code=404, detail="Reçu introuvable")
    patient = await db.profiles.find_one({"id": DEMO_PATIENT_ID}) or {}
    doctor = await db.doctors.find_one({"id": c.get("doctor_id")}) or {}
    content = build_receipt_pdf(c, patient, doctor)
    headers = {"Content-Disposition": f'attachment; filename="recu-doclive-{c["date"]}.pdf"'}
    return Response(content=content, media_type="application/pdf", headers=headers)


@api.get("/profile")
async def get_profile():
    p = await db.profiles.find_one({"id": DEMO_PATIENT_ID})
    if not p:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    p.pop("_id", None)
    return p


@api.put("/profile")
async def update_profile(update: ProfileUpdate):
    data = {k: v for k, v in update.model_dump().items() if v is not None}
    await db.profiles.update_one({"id": DEMO_PATIENT_ID}, {"$set": data})
    p = await db.profiles.find_one({"id": DEMO_PATIENT_ID})
    p.pop("_id", None)
    return p


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
