"""DocLive backend API tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # fallback: read from frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.strip().split("=", 1)[1]
                break
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---- Facets ----
def test_facets(s):
    r = s.get(f"{API}/facets", timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ("specialties", "cities", "languages", "insurances"):
        assert k in d and len(d[k]) > 0, f"{k} empty"
    assert "Dermatologie" in d["specialties"]
    assert "Montréal" in d["cities"]
    assert "Arabe" in d["languages"]
    assert any("Guard.me" == i for i in d["insurances"])


# ---- Doctors list ----
def test_list_doctors_all(s):
    r = s.get(f"{API}/doctors", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["count"] == 8
    assert len(d["doctors"]) == 8
    for doc in d["doctors"]:
        assert "availability" in doc and isinstance(doc["availability"], list)
        assert len(doc["availability"]) >= 1
        # No sunday
        for day in doc["availability"]:
            assert "date" in day and "slots" in day


@pytest.mark.parametrize("param,value,check", [
    ("specialty", "Dermatologie", lambda docs: all(x["specialty"] == "Dermatologie" for x in docs) and len(docs) >= 1),
    ("city", "Montréal", lambda docs: all(x["city"] == "Montréal" for x in docs) and len(docs) >= 1),
    ("language", "Arabe", lambda docs: all("Arabe" in x["languages"] for x in docs) and len(docs) >= 1),
    ("insurance", "Guard.me", lambda docs: all("Guard.me" in x["insurances"] for x in docs) and len(docs) >= 1),
    ("teleconsultation", "true", lambda docs: all(x["teleconsultation"] is True for x in docs) and len(docs) >= 1),
])
def test_doctor_filters(s, param, value, check):
    r = s.get(f"{API}/doctors", params={param: value}, timeout=15)
    assert r.status_code == 200
    docs = r.json()["doctors"]
    assert check(docs), f"filter {param}={value} failed: {[d['id'] for d in docs]}"


def test_get_doctor_ok(s):
    r = s.get(f"{API}/doctors/doc-amelie-tremblay", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["id"] == "doc-amelie-tremblay"
    assert d["availability"]


def test_get_doctor_404(s):
    r = s.get(f"{API}/doctors/unknown-id", timeout=15)
    assert r.status_code == 404


# ---- Appointments ----
def _pick_available_slot(s, doctor_id):
    r = s.get(f"{API}/doctors/{doctor_id}", timeout=15)
    assert r.status_code == 200
    for day in r.json()["availability"]:
        for slot in day["slots"]:
            if slot["available"]:
                return day["date"], slot["time"]
    return None, None


def test_create_and_conflict_appointment(s):
    doctor_id = "doc-karim-benali"
    date_, time_ = _pick_available_slot(s, doctor_id)
    assert date_ and time_, "no available slot"
    body = {
        "doctor_id": doctor_id,
        "date": date_,
        "time": time_,
        "motif": f"TEST_{uuid.uuid4().hex[:6]}",
        "type": "cabinet",
        "patient_name": "TEST Maria",
        "patient_email": "test@example.com",
        "patient_phone": "+15145550000",
        "insurer": "Guard.me",
        "policy_number": "GM-TEST",
    }
    r = s.post(f"{API}/appointments", json=body, timeout=15)
    assert r.status_code == 200, r.text
    appt = r.json()
    assert appt["status"] == "CONFIRMED"
    assert appt["doctor_id"] == doctor_id
    assert appt["date"] == date_ and appt["time"] == time_
    assert "id" in appt

    # Conflict
    r2 = s.post(f"{API}/appointments", json=body, timeout=15)
    assert r2.status_code == 409

    # Persisted in list
    r3 = s.get(f"{API}/appointments", timeout=15)
    assert r3.status_code == 200
    lst = r3.json()
    ids = [a["id"] for a in lst["upcoming"] + lst["history"]]
    assert appt["id"] in ids

    # Cancel
    r4 = s.put(f"{API}/appointments/{appt['id']}/cancel", timeout=15)
    assert r4.status_code == 200
    assert r4.json()["status"] == "CANCELLED"


def test_cancel_404(s):
    r = s.put(f"{API}/appointments/does-not-exist/cancel", timeout=15)
    assert r.status_code == 404


# ---- Consultations ----
def test_consultations(s):
    r = s.get(f"{API}/consultations", timeout=15)
    assert r.status_code == 200
    cs = r.json()["consultations"]
    assert len(cs) >= 3
    for c in cs:
        assert c["diagnosis"] and c["prescription"]
        assert "receipt_amount" in c


# ---- Receipt PDF ----
def test_receipt_pdf_ok(s):
    r = s.get(f"{API}/consultations/cons-1/receipt", timeout=20)
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("application/pdf")
    cd = r.headers.get("content-disposition", "")
    assert "attachment" in cd and "recu-doclive-" in cd and ".pdf" in cd
    assert r.content[:4] == b"%PDF"
    assert len(r.content) > 500


def test_receipt_pdf_404(s):
    r = s.get(f"{API}/consultations/inexistant/receipt", timeout=15)
    assert r.status_code == 404


def test_cancel_moves_to_history(s):
    doctor_id = "doc-sophie-nguyen"
    date_, time_ = _pick_available_slot(s, doctor_id)
    assert date_ and time_
    body = {
        "doctor_id": doctor_id, "date": date_, "time": time_,
        "motif": f"TEST_{uuid.uuid4().hex[:6]}", "type": "cabinet",
        "patient_name": "TEST Cancel", "patient_email": "test@example.com",
    }
    r = s.post(f"{API}/appointments", json=body, timeout=15)
    assert r.status_code == 200
    appt_id = r.json()["id"]
    # Confirm in upcoming
    lst = s.get(f"{API}/appointments", timeout=15).json()
    assert any(a["id"] == appt_id for a in lst["upcoming"])
    # Cancel
    r2 = s.put(f"{API}/appointments/{appt_id}/cancel", timeout=15)
    assert r2.status_code == 200
    assert r2.json()["status"] == "CANCELLED"
    # Now in history, not upcoming
    lst2 = s.get(f"{API}/appointments", timeout=15).json()
    assert not any(a["id"] == appt_id for a in lst2["upcoming"])
    assert any(a["id"] == appt_id for a in lst2["history"])


# ---- Profile ----
def test_profile_get_and_update(s):
    r = s.get(f"{API}/profile", timeout=15)
    assert r.status_code == 200
    p = r.json()
    assert p["id"] == "demo-patient"
    assert "ramq" not in p and "ramq_number" not in p
    original_phone = p.get("phone")

    new_phone = "+1 514 555 " + uuid.uuid4().hex[:4]
    r2 = s.put(f"{API}/profile", json={"phone": new_phone}, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["phone"] == new_phone

    r3 = s.get(f"{API}/profile", timeout=15)
    assert r3.json()["phone"] == new_phone

    # restore
    if original_phone:
        s.put(f"{API}/profile", json={"phone": original_phone}, timeout=15)
