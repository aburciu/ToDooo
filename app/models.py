from flask import Flask
from app import app
from flask.ext.sqlalchemy import SQLAlchemy
from os.path import isfile
from datetime import datetime

db = SQLAlchemy(app)


class Todoitem(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.String(50))
	task = db.Column(db.String(200))
	duedate = db.Column(db.Date)
	done = db.Column(db.Boolean(False))

	def __init__(self, title, task, duedate, done1):
		self.title = title
		self.task = task
		self.duedate = duedate
		self.done = done1

	def __repr__(self):
		return 'Task: %r' % self.title


def row_as_dict(row):
	if not hasattr(row, '__table__'):
		return ''

	d = {}
	for column in row.__table__.columns:
		val = getattr(row, column.name)

		if not (isinstance(val, (bool, int))):
			d[column.name] = str(val)
		else:
			d[column.name] = val
	return d


if not isfile('app/todooo.db'):
	db.create_all()
	print('\nCreating database.. done!\n')