from flask import Blueprint, request, jsonify
from shared.models.user import users, create_user, serialize_user
from bson import ObjectId
import bcrypt, jwt, datetime

auth_bp = Blueprint("shared_auth", __name__)
SECRET = "internportal_secret_2025"

@auth_bp.route("/register", methods=["POST"])
def register():
    d = request.json or {}
    name = d.get("fullName","").strip()
    email = d.get("email","").strip().lower()
    pw = d.get("password","")
    role = d.get("role","intern").lower()
    if not name or not email or not pw:
        return jsonify({"error":"fullName, email and password required"}), 400
    if role not in ["intern","mentor","admin","institution"]:
        return jsonify({"error":"Invalid role. Choose: intern, mentor, admin, institution"}), 400
    if users.find_one({"email":{"$regex":f"^{email}$","$options":"i"}}):
        return jsonify({"error":"Email already registered"}), 409
    hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
    new = create_user(name, email, hashed, role)
    new["createdAt"] = datetime.datetime.utcnow().isoformat()
    result = users.insert_one(new)
    uid = str(result.inserted_id)
    token = jwt.encode({"user_id":uid,"email":email,"role":role,"exp":datetime.datetime.utcnow()+datetime.timedelta(days=7)}, SECRET, algorithm="HS256")
    return jsonify({"message":"Registered","token":token,"user":{"id":uid,"fullName":name,"email":email,"role":role}}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    d = request.json or {}
    email = d.get("email","").strip().lower()
    pw = d.get("password","")
    if not email or not pw:
        return jsonify({"error":"Email and password required"}), 400
    user = users.find_one({"email":{"$regex":f"^{email}$","$options":"i"}})
    if not user:
        return jsonify({"error":"Invalid email or password"}), 401
    try:
        match = bcrypt.checkpw(pw.encode(), user["password"].encode())
    except:
        match = False
    if not match:
        return jsonify({"error":"Invalid email or password"}), 401
    uid = str(user["_id"])
    role = user.get("role","intern")
    token = jwt.encode({"user_id":uid,"email":email,"role":role,"exp":datetime.datetime.utcnow()+datetime.timedelta(days=7)}, SECRET, algorithm="HS256")
    return jsonify({"message":"Login successful","token":token,"user":{"id":uid,"fullName":user.get("fullName",""),"email":email,"role":role}})

@auth_bp.route("/demo-login", methods=["GET","POST"])
def demo_login():
    user = users.find_one({"email":"demo@internportal.com"})
    if not user:
        return jsonify({"error":"Demo user not found. Run seed_demo.py first."}), 404
    uid = str(user["_id"])
    token = jwt.encode({"user_id":uid,"email":"demo@internportal.com","role":"intern","exp":datetime.datetime.utcnow()+datetime.timedelta(days=30)}, SECRET, algorithm="HS256")
    return jsonify({"message":"Demo login","token":token,"user":{"id":uid,"fullName":user.get("fullName","Arjun Sharma"),"email":"demo@internportal.com","role":"intern","isDemo":True}})

@auth_bp.route("/profile/<uid>", methods=["GET"])
def get_profile(uid):
    try: oid = ObjectId(uid.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    u = users.find_one({"_id":oid})
    if not u: return jsonify({"error":"Not found"}), 404
    return jsonify(serialize_user(u))

@auth_bp.route("/profile/<uid>", methods=["PUT"])
def update_profile(uid):
    try: oid = ObjectId(uid.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    fields = {k:d[k] for k in ["fullName","bio","skills","role","phone"] if k in d}
    if not fields: return jsonify({"error":"No fields"}), 400
    users.update_one({"_id":oid},{"$set":fields})
    return jsonify({"message":"Profile updated"})

@auth_bp.route("/profile/<uid>", methods=["DELETE"])
def delete_account(uid):
    try: oid = ObjectId(uid.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    users.delete_one({"_id":oid})
    return jsonify({"message":"Account deleted"})

@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    d = request.json or {}
    uid = d.get("userId","").strip()
    cur = d.get("currentPassword","")
    new_pw = d.get("newPassword","")
    if not uid or not cur or not new_pw: return jsonify({"error":"Missing fields"}), 400
    try: oid = ObjectId(uid)
    except: return jsonify({"error":"Invalid ID"}), 400
    user = users.find_one({"_id":oid})
    if not user: return jsonify({"error":"Not found"}), 404
    if not bcrypt.checkpw(cur.encode(), user["password"].encode()):
        return jsonify({"error":"Current password incorrect"}), 401
    hashed = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode()
    users.update_one({"_id":oid},{"$set":{"password":hashed}})
    return jsonify({"message":"Password changed"})

