from mongoengine import Document, EmbeddedDocument
from mongoengine import BooleanField,DateTimeField,FloatField,StringField, ReferenceField, ListField, FileField, IntField, SequenceField,DecimalField,EmbeddedDocumentListField,EmbeddedDocumentField
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
	ssb_msy = FloatField()
	f_msy = FloatField()
	created_by = ReferenceField("User",reqired=True)
	created_on = DateTimeField(default=datetime.datetime.now, nullable=False)
	changed_by = ReferenceField("User",reqired=True)
	changed_on = DateTimeField(default=datetime.datetime.now,
                        onupdate=datetime.datetime.now, nullable=False)

	def is_default(self):
		if self.default_file is True:
			return Markup('<input type="radio" name="defaultfile" data-sfid="'+str(self.id)+'" data-fileid="'+str(self.file._id)+'" data-ssbmsy="'+str(self.ssb_msy)+'" data-fmsy="'+str(self.f_msy)+'" checked>')
		else:	
			return Markup('<input type="radio" name="defaultfile" data-sfid="'+str(self.id)+'" data-fileid="'+str(self.file._id)+'" data-ssbmsy="'+str(self.ssb_msy)+'" data-fmsy="'+str(self.f_msy)+'" >')

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

class extraParam(EmbeddedDocument):

	spawning_output_1 = ListField(DecimalField())
	spawning_output_2 = ListField(DecimalField())

	length_age_key = ListField(DecimalField()) # matrix
	length_age_key_row_name = ListField(StringField(max_length=5))
	length_age_key_stock1 = ListField(DecimalField())# matrix
	length_age_key_stock2 = ListField(DecimalField())# matrix

	hl_e_pred_F_ave = DecimalField()
	hl_w_pred_F_ave = DecimalField()
	ll_e_pred_F_ave = DecimalField()
	ll_w_pred_F_ave = DecimalField()
	mrip_e_pred_F_ave = DecimalField()
	mrip_w_pred_F_ave = DecimalField()
	hbt_e_pred_F_ave = DecimalField()
	hbt_w_pred_F_ave = DecimalField()
	comm_closed_e_pred_F_ave = DecimalField()
	comm_closed_w_pred_F_ave = DecimalField()
	rec_closed_e_pred_F_ave = DecimalField()
	rec_closed_w_pred_F_ave = DecimalField()
	shrimp_e_pred_F_ave = DecimalField()
	shrimp_w_pred_F_ave = DecimalField()

	hl_e_selex = ListField(DecimalField())
	hl_w_selex = ListField(DecimalField())
	ll_e_selex = ListField(DecimalField())
	ll_w_selex = ListField(DecimalField())
	mrip_e_selex = ListField(DecimalField())
	mrip_w_selex = ListField(DecimalField())
	hbt_e_selex = ListField(DecimalField())
	hbt_w_selex = ListField(DecimalField())
	comm_closed_e_selex = ListField(DecimalField())
	comm_closed_w_selex = ListField(DecimalField())
	rec_closed_e_selex = ListField(DecimalField())
	rec_closed_w_selex = ListField(DecimalField())
	shrimp_e_selex = ListField(DecimalField())
	shrimp_w_selex = ListField(DecimalField())

	hl_e_retention = ListField(DecimalField())
	hl_w_retention = ListField(DecimalField())
	ll_e_retention = ListField(DecimalField())
	ll_w_retention = ListField(DecimalField())
	mrip_e_retention = ListField(DecimalField())
	mrip_w_retention = ListField(DecimalField())
	hbt_e_retention = ListField(DecimalField())
	hbt_w_retention = ListField(DecimalField())

	total_catch_N = ListField(DecimalField())
	sum_SSB_N = ListField(DecimalField())
	Current_F = ListField(DecimalField())
	Current_SSB = ListField(DecimalField())
	MSST = DecimalField()
	MFMT = DecimalField()
	Current_F_ratio = DecimalField()
	Current_SSB_ratio = DecimalField()


class extraF(EmbeddedDocument):

	hl_e_pred_F = FloatField()
	hl_w_pred_F = FloatField()
	ll_e_pred_F = FloatField()
	ll_w_pred_F = FloatField()
	mrip_e_pred_F = FloatField()
	mrip_w_pred_F = FloatField()
	hbt_e_pred_F  = FloatField()
	hbt_w_pred_F  = FloatField()
	comm_closed_e_pred_F = FloatField()
	comm_closed_w_pred_F = FloatField()
	rec_closed_e_pred_F = FloatField()
	rec_closed_w_pred_F = FloatField()
	shrimp_e_pred_F = FloatField()
	shrimp_w_pred_F = FloatField()

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
	stock1_input_file_type = StringField(max_length=2)
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
	sample_size = IntField()
	rnd_seed_setting = StringField(max_length=2)
	#STEP3
	ip_cv_1 = DecimalField()
	ip_cv_2 = DecimalField()
	iniPopu = EmbeddedDocumentListField(GIIniPopulation)
	#STEP4
	bioParam = EmbeddedDocumentListField(BioParameter)
	#STEP5
	simple_spawning = DecimalField()
	nm_cv_1 = DecimalField()
	nm_cv_2 = DecimalField()
	nm_m = StringField(max_length=2)
	mortality = EmbeddedDocumentListField(Mortality)
	#STEP6
	cvForRecu = DecimalField()
	stock1_amount = DecimalField()
	stock2_amount = DecimalField()
	recruitTypeStock1 = StringField(max_length=2)
	fromHisStock1 = StringField(max_length=2)	

	hst1_lower = DecimalField()
	hst1_median = DecimalField()
	hst1_mean = DecimalField()
	hst1_upper = DecimalField()
	hst1_lower_early = DecimalField()
	hst1_median_early = DecimalField()
	hst1_mean_early = DecimalField()
	hst1_upper_early = DecimalField()

	formulaStock1 = StringField(max_length=2)
	fromFmlStock1 = StringField(max_length=2)
	fml1MbhmSSB0 = DecimalField()
	fml1MbhmR0 = DecimalField()
	fml1MbhmR0_early = DecimalField()
	fml1MbhmSteep = DecimalField()

	#step7
	ssb_msy = DecimalField()
	f_msy = FloatField()
	hrt_harvest_rule = StringField(max_length=2)
	mg1_cv = DecimalField()
	#step8
	sec_recreational = DecimalField()
	sec_commercial = DecimalField()
	sec_hire = DecimalField()
	sec_private = DecimalField()
	sec_headboat = DecimalField()
	sec_charterboat = DecimalField()
	sec_pstar = DecimalField()
	sec_act_com = DecimalField()
	sec_act_pri = DecimalField()
	sec_act_hire = DecimalField()

	#step9
	mg3_commercial = DecimalField()
	mg3_recreational = DecimalField()
	mg3_forhire = IntField()
	mg3_private = IntField()
	mg3_rec_east_open = DecimalField()
	mg3_rec_east_closed = DecimalField()
	mg3_rec_west_open = DecimalField()
	mg3_rec_west_closed = DecimalField()
	mg3_comhard_east_open = DecimalField()
	mg3_comhard_east_closed = DecimalField()
	mg3_comhard_west_open = DecimalField()
	mg3_comhard_west_closed = DecimalField()
	mg3_comlong_east_open = DecimalField()
	mg3_comlong_east_closed = DecimalField()
	mg3_comlong_west_open = DecimalField()
	mg3_comlong_west_closed = DecimalField()

	#step10
	mg4_season = StringField(max_length=2)
	mg4_act_catch_hire = DecimalField()
	mg4_act_catch_private = DecimalField()
	mg4_input_hire = DecimalField()
	mg4_hire_length = DecimalField()
	mg4_input_private = DecimalField()
	mg4_private_length = DecimalField()

	#extral
	extra_F = EmbeddedDocumentListField(extraF)
	extraParam = EmbeddedDocumentField(extraParam)

class ProcessGenInput(Document):


	TIMESTEP = (('M', '1 month'),
			('HY', 'half year'),
			('S', '1 season'),
			('Y', '1 year'))

	process_id = ReferenceField("Process",reqired=True)
	#step1
	stock1_model_type = StringField(max_length=2)
	stock1_input_file_type = StringField(max_length=2)
	stock1_filepath = FileField()
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
	sample_size = IntField()
	rnd_seed_setting = StringField(max_length=2)
	rnd_seed_file = ListField(FileField())
	#step2
	unit1to1 = DecimalField()
	unit1to2 = DecimalField()
	unit2to1 = DecimalField()
	unit2to2 = DecimalField()
	#step4
	ip_cv_1 = DecimalField()
	ip_cv_2 = DecimalField()
	iniPopu = EmbeddedDocumentListField(GIIniPopulation)
	#step5
	bioParam = EmbeddedDocumentListField(BioParameter)
	#step6
	mortality_complexity = IntField()

	simple_spawning = DecimalField()
	nm_cv_1 = DecimalField()
	nm_cv_2 = DecimalField()
	nm_m = StringField(max_length=2)

	mortality = EmbeddedDocumentListField(Mortality)
	#step7
	cvForRecu = DecimalField()
	stock1_amount = DecimalField()
	stock2_amount = DecimalField()
	recruitTypeStock1 = StringField(max_length=2)
	fromHisStock1 = StringField(max_length=2)

	historySt1 = StringField(max_length=2)
	hst1_lower = DecimalField()
	hst1_median = DecimalField()
	hst1_mean = DecimalField()
	hst1_upper = DecimalField()
	hst1_other = DecimalField()
	hst1_cal = DecimalField()

	historySt1_early = StringField(max_length=2)
	hst1_lower_early = DecimalField()
	hst1_median_early = DecimalField()
	hst1_mean_early = DecimalField()
	hst1_upper_early = DecimalField()
	hst1_other_early = DecimalField()
	hst1_cal_early = DecimalField()

	formulaStock1 = StringField(max_length=2)
	fromFmlStock1 = StringField(max_length=2)
	fml1MbhmSSB0 = DecimalField()
	fml1MbhmR0 = DecimalField()
	fml1MbhmR0_early = DecimalField()
	fml1MbhmSteep = DecimalField()

	#step8
	bio_catch_mt = DecimalField()
	bio_f_percent = FloatField()
	hrt_harvest_rule = StringField(max_length=2)
	harvest_level = FloatField()
	mg1_cv = DecimalField()

	bio_biomass_points = DecimalField()
	bio_harvest_radio = StringField(max_length=2)


	
	hrt_threshold1 = DecimalField()
	hrt_threshold2 = DecimalField()
	hrt_harvest_radio = StringField(max_length=2)
	hst_catch_thh1 = DecimalField()
	hst_catch_thh2 = DecimalField()
	hst_f_thh1 = DecimalField()
	hst_f_thh2 = DecimalField()

	#step8
	sec_recreational = DecimalField()
	sec_commercial = DecimalField()
	sec_hire = DecimalField()
	sec_private = DecimalField()
	sec_headboat = DecimalField()
	sec_charterboat = DecimalField()
	sec_pstar = DecimalField()
	sec_act_com = DecimalField()
	sec_act_pri = DecimalField()
	sec_act_hire = DecimalField()

	fleet_rec_stock = EmbeddedDocumentListField(Allocation)
	fleet_com_stock = EmbeddedDocumentListField(Allocation)
	fishingStartDate = DateTimeField(default=datetime.datetime.now)
	fishingEndDate = DateTimeField(default=datetime.datetime.now)
	
	#step9
	mg3_commercial = DecimalField()
	mg3_recreational = DecimalField()
	mg3_forhire = IntField()
	mg3_private = IntField()
	mg3_rec_east_open = DecimalField()
	mg3_rec_east_closed = DecimalField()
	mg3_rec_west_open = DecimalField()
	mg3_rec_west_closed = DecimalField()
	mg3_comhard_east_open = DecimalField()
	mg3_comhard_east_closed = DecimalField()
	mg3_comhard_west_open = DecimalField()
	mg3_comhard_west_closed = DecimalField()
	mg3_comlong_east_open = DecimalField()
	mg3_comlong_east_closed = DecimalField()
	mg3_comlong_west_open = DecimalField()
	mg3_comlong_west_closed = DecimalField()

	#step10
	mg4_season = StringField(max_length=2)
	mg4_act_catch_hire = DecimalField()
	mg4_act_catch_private = DecimalField()
	mg4_input_hire = DecimalField()
	mg4_hire_length = DecimalField()
	mg4_input_private = DecimalField()
	mg4_private_length = DecimalField()

	#extral
	extra_F = EmbeddedDocumentListField(extraF)


	created_by = ReferenceField("User",reqired=True)
	created_on = DateTimeField(default=datetime.datetime.now, nullable=False)
	changed_by = ReferenceField("User",reqired=True)
	changed_on = DateTimeField(default=datetime.datetime.now,
                        onupdate=datetime.datetime.now, nullable=False)

	def to_dict(self):
		return mongo_to_dict(self)

class MseResultSingle(EmbeddedDocument):

	year = IntField()
	AM_comm_median = FloatField()
	AM_comm_975 = FloatField()
	AM_comm_025 = FloatField()
	AM_recr_median = FloatField()
	AM_recr_975 = FloatField()
	AM_recr_025 = FloatField()
	SSB_total_median = FloatField()
	SSB_total_975 = FloatField()
	SSB_total_025 = FloatField()
	SSB_1_median = FloatField()
	SSB_1_975 = FloatField()
	SSB_1_025 = FloatField()
	SSB_2_median = FloatField()
	SSB_2_975 = FloatField()
	SSB_2_025 = FloatField()
	Forhire_planned_season_length_median = FloatField()
	Forhire_planned_season_length_975 = FloatField()
	Forhire_planned_season_length_025 = FloatField()
	Private_planned_season_length_median = FloatField()
	Private_planned_season_length_975 = FloatField()
	Private_planned_season_length_025 = FloatField()
	F_general_median = FloatField()
	F_general_975 = FloatField()
	F_general_025 = FloatField()
	SSB_total_ratio_median = FloatField()
	F_general_ratio_median = FloatField()

class MseResultList(Document):

	process_gen_id = StringField(max_length=500,reqired=True)
	resultlist = EmbeddedDocumentListField(MseResultSingle)
	Year_to_green_mean = FloatField()
	total_catch_MSEcomp = FloatField()
	catch_var_MSEcomp = FloatField()
	terminal_SSB_MSEcomp = FloatField()
	lowest_SSB_MSEcomp = FloatField()
	total_recr_catch_MSEcomp = FloatField()
	catch_recr_var_MSEcomp = FloatField()
	total_comm_catch_MSEcomp = FloatField()
	catch_comm_var_MSEcomp = FloatField()