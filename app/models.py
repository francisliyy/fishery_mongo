from mongoengine import Document, EmbeddedDocument
from mongoengine import BooleanField,DateTimeField, StringField, ReferenceField, ListField, FileField, IntField, SequenceField,DecimalField,EmbeddedDocumentListField
from flask import Markup, url_for
from flask_appbuilder.models.decorators import renders
#from flask_appbuilder.security.mongoengine.models import *
from flask_login import current_user
import datetime
import json
from app.jsonUtils import mongo_to_dict
"""

Define you MongoEngine Models here

"""

class StockFile(Document):


	file = FileField(required=True)
	description = StringField(max_length=500)
	default_file = BooleanField(default=False)
	created_by = ReferenceField("User",reqired=True)
	created_on = DateTimeField(default=datetime.datetime.now, nullable=False)
	changed_by = ReferenceField("User",reqired=True)
	changed_on = DateTimeField(default=datetime.datetime.now,
                        onupdate=datetime.datetime.now, nullable=False)

	def is_default(self):
		if self.default_file is True:
			return Markup('<input type="radio" name="defaultfile" data-sfid="'+str(self.id)+'" data-fileid="'+str(self.file._id)+'" checked>')
		else:	
			return Markup('<input type="radio" name="defaultfile" data-sfid="'+str(self.id)+'" data-fileid="'+str(self.file._id)+'" >')

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

class BioParameter(EmbeddedDocument):

	age_1 = IntField()
	weight_at_age_1 = DecimalField()
	fec_at_age_1 = DecimalField()
	weight_at_age_2 = DecimalField()
	fec_at_age_2 = DecimalField()

class Mortality(EmbeddedDocument):

	age_1 = IntField()
	mean_1 = DecimalField()
	cv_mean_1 = DecimalField()
	mean_2 = DecimalField()
	cv_mean_2 = DecimalField()

class Allocation(EmbeddedDocument):

	stock = StringField(max_length=50)
	fleet = StringField(max_length=50)
	allocation = DecimalField()

class LandingRatio(EmbeddedDocument):

	stock = StringField(max_length=50)
	state = StringField(max_length=50)
	ratio = DecimalField()

class DiscardRatio(EmbeddedDocument):

	stock = StringField(max_length=50)
	fleet = StringField(max_length=50)
	oc = StringField(max_length=50)
	ratio = DecimalField()

class Process(Document):

	PROPRIVACY = (('PV', 'private'),
		('PB', 'public'))
	PROVERSION = (('SP', 'simple'),
		('PF', 'profession'))

	process_name = StringField(max_length=50)
	process_description = StringField(max_length=1000)
	process_public = BooleanField(default=False)
	process_simple = BooleanField(default=True)
	created_by = ReferenceField("User",reqired=True)
	created_on = DateTimeField(default=datetime.datetime.now, nullable=False)
	changed_by = ReferenceField("User",reqired=True)
	changed_on = DateTimeField(default=datetime.datetime.now,nullable=False)

	def pro_name(self):
		if self.process_name:
			return Markup('<a href="' + url_for('ProcessView.showProStep',pk=str(self.id))+'">'+self.process_name)

		else:
			return Markup('')

	def is_public(self):
		if self.process_public is True:
			return Markup('<input type="checkbox" name="propublic" data-proid='+str(self.id)+' checked data-toggle="toggle">')
		else:	
			return Markup('<input type="checkbox" name="propublic" data-proid='+str(self.id)+' data-toggle="toggle">')

	def is_simple(self):
		if self.process_simple is True:
			return Markup('<input type="checkbox" name="prosimple" data-proid='+str(self.id)+' checked data-toggle="toggle">')
		else:	
			return Markup('<input type="checkbox" name="prosimple" data-proid='+str(self.id)+' data-toggle="toggle">')

	def advance_compare(self):
		return Markup('<input name="radiopid" type="radio" value="' + str(self.id)+'">')

	def guest_pro_name(self):
		if self.process_name:
			return Markup('<a href="' + url_for('GuestProcessView.guestProStep',pk=str(self.id))+'">'+self.process_name)

		else:
			return Markup('')

class GlobalSettings(Document):

	#STEP1
	stock1_model_type = StringField(max_length=2)
   	#STEP2
	time_step = StringField(max_length=2)
	start_projection = DateTimeField()
	short_term_mgt = IntField()
	short_term_unit = StringField(max_length=2)
	long_term_mgt = IntField()
	long_term_unit = StringField(max_length=2)
	stock_per_mgt_unit = IntField()
	mixing_pattern = StringField(max_length=2)
	last_age = IntField()
	no_of_interations = IntField()
	rnd_seed_setting = StringField(max_length=2)
	#STEP3
	iniPopu = EmbeddedDocumentListField(GIIniPopulation)
	#STEP4
	bioParam = EmbeddedDocumentListField(BioParameter)
	#STEP5
	simple_spawning = DecimalField()
	mortality = EmbeddedDocumentListField(Mortality)
	#STEP6
	recruitTypeStock1 = StringField(max_length=2)
	formulaStock1 = StringField(max_length=2)
	fml1MbhmSSB0 = DecimalField()
	fml1MbhmR0 = DecimalField()
	fml1MbhmSteep = DecimalField()
	cv1Recruit = DecimalField()

	recruitTypeStock2 = StringField(max_length=2)
	formulaStock2 = StringField(max_length=2)
	fml2MbhmSSB0 = DecimalField()
	fml2MbhmR0 = DecimalField()
	fml2MbhmSteep = DecimalField()
	cv2Recruit = DecimalField()

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
	rnd_seed_setting = StringField(max_length=2)
	rnd_seed_file = ListField(FileField())
	#step2
	unit1to1 = DecimalField()
	unit1to2 = DecimalField()
	unit2to1 = DecimalField()
	unit2to2 = DecimalField()
	#step3
	stock1_model_type = StringField(max_length=2)
	stock1_filepath = FileField()
	stock2_model_type = StringField(max_length=2)
	stock2_filepath = FileField()
	#step4
	iniPopu = EmbeddedDocumentListField(GIIniPopulation)
	#step5
	bioParam = EmbeddedDocumentListField(BioParameter)
	#step6
	mortality_complexity = IntField()

	simple_spawning = DecimalField()

	mortality = EmbeddedDocumentListField(Mortality)
	#step7
	recruitTypeStock1 = StringField(max_length=2)

	historySt1 = StringField(max_length=2)
	hst1_lower = DecimalField()
	hst1_median = DecimalField()
	hst1_mean = DecimalField()
	hst1_upper = DecimalField()
	hst1_other = DecimalField()
	hst1_cal = DecimalField()

	formulaStock1 = StringField(max_length=2)
	fml1Bmalpha1 = DecimalField()
	fml1Bmbeta1 = DecimalField()
	fml1Rmalpha1 = DecimalField()
	fml1Rmbeta1 = DecimalField()
	fml1MbhmSSB0 = DecimalField()
	fml1MbhmR0 = DecimalField()
	fml1MbhmSteep = DecimalField()

	auto1R0 = DecimalField()
	auto1h = DecimalField()
	auto1Rave = DecimalField()

	cv1Recruit = DecimalField()

	recruitTypeStock2 = StringField(max_length=2)

	historySt2 = StringField(max_length=2)
	hst2_lower = DecimalField()
	hst2_median = DecimalField()
	hst2_mean = DecimalField()
	hst2_upper = DecimalField()
	hst2_other = DecimalField()
	hst2_cal = DecimalField()

	formulaStock2 = StringField(max_length=2)
	fml2Bmalpha1 = DecimalField()
	fml2Bmbeta1 = DecimalField()
	fml2Rmalpha1 = DecimalField()
	fml2Rmbeta1 = DecimalField()
	fml2MbhmSSB0 = DecimalField()
	fml2MbhmR0 = DecimalField()
	fml2MbhmSteep = DecimalField()

	auto2R0 = DecimalField()
	auto2h = DecimalField()
	auto2Rave = DecimalField()

	cv2Recruit = DecimalField()
	#step8
	bio_biomass_points = DecimalField()
	bio_harvest_radio = StringField(max_length=2)
	bio_catch_mt = DecimalField()
	bio_f_percent = DecimalField()

	hrt_harvest_rule = StringField(max_length=2)
	hrt_threshold1 = DecimalField()
	hrt_threshold2 = DecimalField()
	hrt_harvest_radio = StringField(max_length=2)
	hst_catch_thh1 = DecimalField()
	hst_catch_thh2 = DecimalField()
	hst_f_thh1 = DecimalField()
	hst_f_thh2 = DecimalField()
	#step9
	sec_recreational = DecimalField()
	sec_commercial = DecimalField()
	fleet_rec_stock = EmbeddedDocumentListField(Allocation)
	fleet_com_stock = EmbeddedDocumentListField(Allocation)
	fishingStartDate = DateTimeField(default=datetime.datetime.now)
	fishingEndDate = DateTimeField(default=datetime.datetime.now)
	#step10
	ratio_rec_ratio = EmbeddedDocumentListField(LandingRatio)
	ratio_com_ratio = EmbeddedDocumentListField(LandingRatio)
	discard_rec_ratio = EmbeddedDocumentListField(DiscardRatio)
	discard_com_ratio = EmbeddedDocumentListField(DiscardRatio)


	created_by = ReferenceField("User",reqired=True)
	created_on = DateTimeField(default=datetime.datetime.now, nullable=False)
	changed_by = ReferenceField("User",reqired=True)
	changed_on = DateTimeField(default=datetime.datetime.now,
                        onupdate=datetime.datetime.now, nullable=False)

	def to_dict(self):
		return mongo_to_dict(self)
