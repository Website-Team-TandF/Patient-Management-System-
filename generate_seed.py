import json
import random
import datetime
import os
import binascii

def ObjectId():
    """Generates a random 24-character hex string similar to MongoDB ObjectId"""
    return binascii.b2a_hex(os.urandom(12)).decode('utf-8')

# Setup
NUM_PATIENTS = 20
NUM_VISITS = 50

HOSPITAL_IDS = [
    "65a000000000000000000001",
    "65a000000000000000000002",
    "65a000000000000000000003"
]

DOCTOR_IDS = [
    "65b000000000000000000001",
    "65b000000000000000000002"
]

DISEASES = [
    "Diabetes", "Hypertension", "Thyroid", "Joint Pain", "Migraine", 
    "Gastritis", "Skin Allergy", "Arthritis", "Asthma", "PCOS"
]

TREATMENTS = [
    "Nadi Pariksha", "Panchakarma", "Shirodhara", "Brahmi Vati", 
    "Triphala Churna", "Abhyanga", "Nasya", "Virechana"
]

CITIES = ["Mumbai", "Pune", "Delhi", "Bangalore", "Nashik", "Nagpur"]
STATES = ["Maharashtra", "Delhi", "Karnataka"]

FIRST_NAMES = ["Amit", "Priya", "Rahul", "Sneha", "Vijay", "Anita", "Suresh", "Kavita", "Ramesh", "Pooja", "Arjun", "Meera", "Vikram", "Riya", "Sanjay", "Neha", "Raj", "Anjali", "Deepak", "Soma"]
LAST_NAMES = ["Sharma", "Patel", "Singh", "Gupta", "Deshmukh", "Joshi", "Kulkarni", "Rao", "Nair", "Reddy", "Mehta", "Shah", "Verma", "Kumar", "Yadav"]

patients = []
visits = []

def get_random_date(start_date, end_date):
    delta = end_date - start_date
    random_days = random.randrange(delta.days)
    return start_date + datetime.timedelta(days=random_days)

now = datetime.datetime.now()
one_year_ago = now - datetime.timedelta(days=365)

# Generate Patients
for i in range(NUM_PATIENTS):
    p_id = str(ObjectId())
    
    # Ensure realistic phone numbers
    phone = f"98{''.join([str(random.randint(0, 9)) for _ in range(8)])}"
    
    fname = random.choice(FIRST_NAMES)
    lname = random.choice(LAST_NAMES)
    
    created_date = get_random_date(one_year_ago, now)
    
    patient = {
        "_id": {"$oid": p_id},
        "name": f"{fname} {lname}",
        "email": f"{fname.lower()}.{lname.lower()}@example.com",
        "phoneNo": phone,
        "age": random.randint(18, 75),
        "sex": random.choice(["male", "female"]),
        "dob": {"$date": (created_date - datetime.timedelta(days=random.randint(6500, 27000))).isoformat() + "Z"},
        "address": {
            "city": random.choice(CITIES),
            "state": random.choice(STATES),
            "street": f"Sector {random.randint(1, 100)}"
        },
        "createdAt": {"$date": created_date.isoformat() + "Z"},
        "updatedAt": {"$date": created_date.isoformat() + "Z"},
        "__v": 0
    }
    patients.append(patient)

# Generate Visits
for i in range(NUM_VISITS):
    # Pick a random patient
    pat = random.choice(patients)
    pat_id = pat["_id"]["$oid"]
    
    # Visit date (must be after patient creation)
    pat_created = datetime.datetime.fromisoformat(pat["createdAt"]["$date"].replace('Z', ''))
    if pat_created > now: pat_created = now # safety
    
    visit_date = get_random_date(pat_created, now)
    
    disease = random.sample(DISEASES, k=random.randint(1, 2))
    treatment = random.sample(TREATMENTS, k=random.randint(1, 2))
    
    visit_token = random.randint(1, 50)
    
    visit = {
        "_id": {"$oid": str(ObjectId())},
        "visitToken": visit_token,
        "patientId": {"$oid": pat_id},
        "hospitalId": {"$oid": random.choice(HOSPITAL_IDS)},
        "doctorId": {"$oid": random.choice(DOCTOR_IDS)},
        "status": "done",
        "disease": disease,
        "diseaseDuration": f"{random.randint(1, 12)} months",
        "presentSymptoms": [f"Symptom {k}" for k in range(1, random.randint(2, 4))],
        "previousTreatment": ["Allopathy" if random.random() > 0.5 else "Homeopathy"],
        "treatmentGiven": treatment,
        "vitals": {
            "pulse": random.randint(70, 90),
            "bp": f"{random.randint(110, 140)}/{random.randint(70, 90)}",
            "temperature": round(random.uniform(97, 99), 1)
        },
        "otherProblems": {
            "acidity": random.choice([True, False]),
            "diabetes": "Diabetes" in disease,
            "constipation": random.choice([True, False]),
            "amebiasis": False,
            "bp": "Hypertension" in disease,
            "heartProblems": False,
            "other": ""
        },
        "medicinesGiven": [f"Med {k}" for k in range(1, random.randint(2, 4))],
        "advice": "Drink warm water, Avoid spicy food",
        "followUpDate": (visit_date + datetime.timedelta(days=15)).strftime("%Y-%m-%d"),
        "createdAt": {"$date": visit_date.isoformat() + "Z"},
        "updatedAt": {"$date": visit_date.isoformat() + "Z"},
        "__v": 0
    }
    visits.append(visit)

# Output files
import os
os.makedirs("database_seed", exist_ok=True)

with open("database_seed/patients.json", "w") as f:
    json.dump(patients, f, indent=2)

with open("database_seed/visits.json", "w") as f:
    json.dump(visits, f, indent=2)

print(f"Generated {NUM_PATIENTS} patients and {NUM_VISITS} visits in database_seed/")
