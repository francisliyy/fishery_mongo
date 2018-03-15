from mongoengine import Document, EmbeddedDocument
from mongoengine import DateTimeField, StringField, ReferenceField, ListField, FileField, IntField, SequenceField,DecimalField,EmbeddedDocumentListField
from flask import Markup, url_for
from flask_appbuilder.models.decorators import renders
#from flask_appbuilder.security.mongoengine.models import *
from flask_login import current_user
import datetime

"""

Define you MongoEngine Models here

"""

class StockFile(Document):


	file = FileField(required=True)
	description = StringField(max_length=500)
	created_by = ReferenceField("User",reqired=True)
	created_on = DateTimeField(default=datetime.datetime.now, nullable=False)
	changed_by = ReferenceField("User",reqired=True)
	changed_on = DateTimeField(default=datetime.datetime.now,
                        onupdate=datetime.datetime.now, nullable=False)


	def download(self):
		if self.file:
			return Markup('<a href="' + url_for('StockFileView.download',pk=str(self.id))+'">Download')

		else:
			return Markup('')

	def file_name(self):
		return self.file.name


class GIIniPopulation(EmbeddedDocument):

	age_1 = IntField()
	stock_1_mean = DecimalField()
	cv_1 = DecimalField()
	stock_2_mean = DecimalField()
	cv_2 = DecimalField()

class Process(Document):

    process_name = StringField(max_length=50)
    process_description = StringField(max_length=1000)
    created_by = ReferenceField("User",reqired=True)
    created_on = DateTimeField(default=datetime.datetime.now, nullable=False)
    changed_by = ReferenceField("User",reqired=True)
    changed_on = DateTimeField(default=datetime.datetime.now,
                        onupdate=datetime.datetime.now, nullable=False)

    def pro_name(self):
        if self.process_name:
            return Markup('<a href="' + url_for('ProcessView.showProStep',pk=str(self.id))+'">'+self.process_name)

        else:
            return Markup('')


class ProcessGenInput(Document):


	TIMESTEP = (('M', '1 month'),
			('HY', 'half year'),
			('S', '1 season'),
			('Y', '1 year'))

	process_id = ReferenceField("Process",reqired=True)
	#step1
	time_step = StringField(max_length=2,choices=TIMESTEP)
	start_projection = DateTimeField(default=datetime.datetime.now)
	short_term_mgt = IntField()
	short_term_unit = StringField(max_length=2)
	long_term_mgt = IntField()
	long_term_unit = StringField(max_length=2)
	stock_per_mgt_unit = IntField()
	mixing_pattern = StringField(max_length=2)
	last_age = IntField()
	no_of_interations = IntField()
	rnd_seed_file = FileField()
	#step2
	unit1to1 = DecimalField()
	unit1to2 = DecimalField()
	unit2to1 = DecimalField()
	unit2to2 = DecimalField()
	#step3
	stock1_model_type = StringField(max_length=2)
	stock1_filepath = StringField(max_length=100)
	stock2_model_type = StringField(max_length=2)
	stock2_filepath = StringField(max_length=100)
	#step4
	iniPopu = EmbeddedDocumentListField(GIIniPopulation)

	created_by = ReferenceField("User",reqired=True)
	created_on = DateTimeField(default=datetime.datetime.now, nullable=False)
	changed_by = ReferenceField("User",reqired=True)
	changed_on = DateTimeField(default=datetime.datetime.now,
                        onupdate=datetime.datetime.now, nullable=False)

