from mongoengine import Document
from mongoengine import DateTimeField, StringField, ReferenceField, ListField, FileField
from flask import Markup, url_for
from flask_appbuilder.security.mongoengine.models import *
from flask_login import current_user
import datetime

"""

Define you MongoEngine Models here

"""

class StockFile(Document):


	file = FileField(required=True)
	description = StringField(max_length=500)
	created_by = ReferenceField("User",default=get_user_id())
	created_on = DateTimeField(default=datetime.datetime.now, nullable=False)
	changed_by = ReferenceField("User",default=get_user_id())
	changed_on = DateTimeField(default=datetime.datetime.now,
                        onupdate=datetime.datetime.now, nullable=False)

	def download(self):
		if self.file:
			return Markup('<a href="' + url_for('StockFileView.download',pk=str(self.id))+'">Download')

		else:
			return Markup('')

	def file_name(self):
		return self.file.name