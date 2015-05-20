from app import app, models
from flask import Flask, request, abort, jsonify
from datetime import datetime
from app.models import Todoitem
from app import auth


# Credentials for API use
users = {
	'tictail': 'todos',
	'guest': 'temp' 
}


# Error messages
db_read_err = {'error': 'Cannot read from database.'}
not_found_err = {'error': 'Not found.'}
not_allowed_err = {'error': 'Method not allowed.'}
bad_request_err = {'error': 'Bad request.'}


# Serve the static client-side app
@app.route("/")
def index():
	return app.send_static_file('index.html')


# Require auth for POST methods
@auth.get_password
def get_pass(username):
	if username in users:
		return users.get(username)
	return None


# Status check
@app.route("/api/")
@auth.login_required
def apistatus():
	return jsonify({'apistatus':'Woo hoo! Todooo API v0.5 is running.'})


#
# GET routes for ToDo items
#

@app.route("/api/todos/", methods=['GET'])
def get_todos():
	try:
		tasks = Todoitem.query.all()
	except Exception as e:
		print("Error: %s" % e)
		return jsonify(db_read_err)

	output = []
	for task in tasks:
		output.append(models.row_as_dict(task))

	if not output:
		abort(404)

	return jsonify({'todos': output})


@app.route("/api/todos/<int:todo_id>", methods=['GET'])
def get_todo(todo_id):
	todo = Todoitem.query.get(todo_id)
	output = models.row_as_dict(todo)

	if len(output) == 0:
		abort(404)

	return jsonify({'todo': output})


#
# POST routes for ToDo items
#

keys = ['id','title','task','duedate','done']

@app.route('/api/todos/',methods=['POST'])
@auth.login_required
def new_or_update_todos():
	if not request.json:
		abort(400)
	
	#print(request.data)

	if 'todos' in request.json:
		if isinstance(request.json['todos'], list):
			for todo in request.json['todos']:
				print(todo['id'], todo['done'])

				if isinstance(todo['done'], bool):
					done = todo['done']
				else:
					abort(400)

				try:
					todo = Todoitem.query.get(todo['id'])
					todo.done = done
					models.db.session.commit()

				except Exception as e:
					print("Error: %s" % e)
					abort(400)

			return get_todos()

	else:
		for key in keys:
			if key not in ['id', 'done']:
				if not key in request.json:
					print(key)
					abort(400)

		try:
			todo_date_time = datetime.strptime(request.json['duedate'], "%m/%d/%Y")

			todo = Todoitem(request.json['title'], request.json['task'], todo_date_time, False)
			models.db.session.add(todo)
			models.db.session.commit()

			output = models.row_as_dict(todo)

			if len(output) == 0: ##############
				abort(400)

			return jsonify({"todo": output})
		except Exception as e:
			print("Error: %s" % e)

		abort(400)


@app.route('/api/todos/<int:todo_id>',methods=['POST'])
@auth.login_required
def update_todo(todo_id):
	if not request.json:
		abort(400)
	
	todo = Todoitem.query.get(todo_id)
	
	for key in keys:
		if key in request.json and key is not 'id':
			new_val = request.json[key]
			if key is 'duedate':
				new_val = datetime.strptime(request.json['duedate'], "%Y-%m-%d")
			setattr(todo, key, new_val)

	try:
		models.db.session.commit()
		output = models.row_as_dict(todo)
	except Exception as e:
		print("Error: %s" % e)
		abort(400)

	return jsonify({"todo": output})


#
# DELETE route for ToDo items
#

@app.route('/api/todos/<int:todo_id>',methods=['DELETE'])
@auth.login_required
def delete_todo(todo_id):
	todo = Todoitem.query.get(todo_id)
	models.db.session.delete(todo)
	models.db.session.commit()

	return(jsonify({'deleted': todo_id}))


# Error handling
@app.errorhandler(400)
def method_not_allowed(error):
	return jsonify(bad_request_err), 400

@app.errorhandler(404)
def page_not_found(error):
	return jsonify(not_found_err), 404

@app.errorhandler(405)
def method_not_allowed(error):
	return jsonify(not_allowed_err), 405
