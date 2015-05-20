from app import app, models
from datetime import datetime

task1 = models.Todoitem('Finish Flask App', 'Use a great mix of latest py.tech to finish To-Do app.', datetime.now().date(), True)
task2 = models.Todoitem('Remember the milk', 'Buy low-fat and fresh milk', datetime.now().date(), False)

print('Addding a few sample to-do tasks.. done!')

models.db.session.add(task1)
models.db.session.add(task2)

models.db.session.commit()