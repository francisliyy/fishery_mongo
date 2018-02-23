from mongoengine import Document
from mongoengine import DateTimeField, StringField, ReferenceField, ListField, FileField
from flask import Markup, url_for
from flask_appbuilder.filemanager import get_file_original_name
from flask_appbuilder.models.mixins import AuditMixin

"""

Define you MongoEngine Models here

"""

class StockFile(AuditMixin,Document):
	file = FileField()
	description = StringField(max_length=500)

	def download(self):
		if self.file:
			return Markup('<a href="' + url_for('StockFileView.download',pk=str(self.id))+'">Download')

		else:
			return Markup('')

	def file_name(self):
		return self.file.name