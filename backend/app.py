"""
InternPortal Backend — Smart Internship Workflow and Evaluation Portal
======================================================================
Separate API routes per role:

  SHARED  (auth, users, messages, mentors)
    POST   /auth/register
    POST   /auth/login
    GET    /auth/demo-login
    GET    /auth/profile/<id>
    PUT    /auth/profile/<id>
    DELETE /auth/profile/<id>
    POST   /auth/change-password
    POST   /messages/send
    GET    /messages/conversation
    GET    /messages/conversations/<id>
    GET    /mentors/all
    POST   /mentors/add
    POST   /mentors/connect/<id>

  INTERN  (tasks, journals, attendance, calendar, settings)
    GET/POST        /intern/tasks/
    PUT/DELETE      /intern/tasks/<id>
    PATCH           /intern/tasks/<id>/status
    GET/POST        /intern/journals/
    PUT/DELETE      /intern/journals/<id>
    POST            /intern/journals/<id>/comment
    POST            /intern/attendance/checkin
    PATCH           /intern/attendance/checkout/<id>
    GET             /intern/attendance/all
    GET             /intern/attendance/stats
    GET/POST        /intern/calendar/all  /intern/calendar/add
    GET/PUT         /intern/settings/<uid>

  MENTOR  (evaluations, rubrics, submissions, feedback, performance)
    GET/POST        /mentor/rubrics
    DELETE          /mentor/rubrics/<id>
    POST            /mentor/evaluations/submit
    GET             /mentor/evaluations/intern/<id>
    GET             /mentor/evaluations/all
    GET/POST        /mentor/submissions
    PATCH           /mentor/submissions/<id>/review
    POST/GET        /mentor/feedback
    GET             /mentor/performance/<intern_id>

  ADMIN   (all data, user management, logs)
    GET             /admin/overview
    GET             /admin/users
    DELETE          /admin/users/<id>
    PATCH           /admin/users/<id>/role
    GET             /admin/interns/tasks
    GET             /admin/interns/attendance
    GET             /admin/interns/journals
    GET             /admin/mentors/evaluations
    GET             /admin/logs
    GET             /admin/institution/overview

  INSTITUTION  (monitoring, score analytics, reports)
    GET             /institution/overview
    GET             /institution/score-analytics
    GET/POST        /institution/reports
    DELETE          /institution/reports/<id>
    GET/PUT         /institution/settings/<uid>
"""
import sys, os
from dotenv import load_dotenv

load_dotenv()

print("GROQ_API_KEY:", os.getenv("GROQ_API_KEY"))

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, jsonify
from flask_cors import CORS

# ── AI (Groq) route ───────────────────────────────────────────────────────────
from shared.routes.ai_routes import ai_bp

# ── Shared routes ─────────────────────────────────────────────────────────────
from shared.routes.auth_routes import auth_bp
from shared.routes.message_routes import msg_bp
from shared.models.mentor import mentors  # triggers seed

# ── Intern routes ─────────────────────────────────────────────────────────────
from intern.routes.task_routes import intern_task_bp
from intern.routes.journal_routes import intern_journal_bp
from intern.routes.attendance_routes import intern_att_bp
from intern.routes.calendar_routes import intern_cal_bp
from intern.routes.settings_routes import intern_settings_bp

# ── Mentor routes ─────────────────────────────────────────────────────────────
from mentor.routes.evaluation_routes import mentor_eval_bp
from mentor.routes.task_routes import mentor_task_bp
from mentor.routes.calendar_routes import mentor_cal_bp
from mentor.routes.message_routes import mentor_msg_bp

# ── Admin Portal routes ───────────────────────────────────────────────────────
from admin.routes.admin_routes import admin_bp as admin_portal_bp

# ── Evaluation Portal routes ──────────────────────────────────────────────────
from evaluation.routes.evaluation_routes import eval_portal_bp

# ── Institution routes ────────────────────────────────────────────────────────
from institution.routes.institution_routes import inst_bp

# ── Mentor list (shared) ──────────────────────────────────────────────────────
from shared.routes.mentor_routes import mentor_list_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000","http://127.0.0.1:3000"]}})

# ── Register blueprints ───────────────────────────────────────────────────────
app.register_blueprint(ai_bp,              url_prefix="/ai")
app.register_blueprint(auth_bp,            url_prefix="/auth")
app.register_blueprint(msg_bp,             url_prefix="/messages")
app.register_blueprint(mentor_list_bp,     url_prefix="/mentors")

app.register_blueprint(intern_task_bp,     url_prefix="/intern/tasks")
app.register_blueprint(intern_journal_bp,  url_prefix="/intern/journals")
app.register_blueprint(intern_att_bp,      url_prefix="/intern/attendance")
app.register_blueprint(intern_cal_bp,      url_prefix="/intern/calendar")
app.register_blueprint(intern_settings_bp, url_prefix="/intern/settings")

app.register_blueprint(mentor_eval_bp,     url_prefix="/mentor")
app.register_blueprint(mentor_task_bp,     url_prefix="/mentor/tasks")
app.register_blueprint(mentor_cal_bp,      url_prefix="/mentor/calendar")
app.register_blueprint(mentor_msg_bp,      url_prefix="/mentor/messages")

app.register_blueprint(admin_portal_bp,    url_prefix="/admin")

app.register_blueprint(eval_portal_bp,     url_prefix="/evaluation-portal")
app.register_blueprint(inst_bp,            url_prefix="/institution")

@app.route("/")
def home():
    return jsonify({
        "status": "✅ InternPortal Backend Running",
        "project": "Smart Internship Workflow and Evaluation Portal",
        "version": "3.0",
        "databases": {
            "shared_db":      "users, messages, mentors",
            "intern_db":      "intern_tasks, intern_journals, intern_attendance, intern_calendar, intern_settings",
            "mentor_db":      "mentor_evaluations, mentor_rubrics, mentor_submissions, mentor_feedback",
            "admin_db":       "admin_logs, admin_settings",
            "institution_db": "institution_reports, institution_score_analytics"
        },
        "portals": {
            "intern":      "http://localhost:3000/intern/dashboard",
            "mentor":      "http://localhost:3000/mentor/dashboard",
            "admin":       "http://localhost:3000/admin/dashboard",
            "institution": "http://localhost:3000/institution/dashboard"
        }
    })

@app.errorhandler(404)
def not_found(e): return jsonify({"error":"Route not found"}), 404

@app.errorhandler(500)
def server_error(e): return jsonify({"error":"Internal server error","detail":str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")
