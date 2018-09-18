from flask import render_template,jsonify,Response,request,make_response,flash,redirect
from flask.ext.appbuilder import ModelView
from flask.ext.appbuilder.models.mongoengine.interface import MongoEngineInterface
from flask_appbuilder.models.mongoengine.filters import FilterEqual,FilterEqualFunction
from flask_appbuilder.actions import action
from app import appbuilder
from flask_appbuilder import BaseView, expose, has_access
from flask_login import current_user
from werkzeug import secure_filename
from wtforms.fields import SelectField,TextField
from app.models import *
from app.rutils import *
from app.fileUtils import *
from app.customize.mongointerface import ProcessOrMongoEngineInterface
from bson import json_util
import pandas as pd
import numpy as np
import json
import datetime
import os
import mongoengine
#from flask import _app_ctx_stack
#from flask.globals import _request_ctx_stack


"""
    Define you Views here
"""

"""
        r invoke
        #rutils = RUtil()
        #rutils.runScript("app/static/rscript/rplots.r");
"""

def get_user():
    return current_user.id

class GuestProcessView(ModelView):

    datamodel = MongoEngineInterface(Process)

    list_template = 'list_process_guest.html'

    label_columns = {'guest_pro_name': 'Process Name'}

    base_permissions = ['can_list']

    list_columns = ['guest_pro_name','created_by', 'created_on', 'changed_by', 'changed_on','process_public','process_simple']
    formatters_columns = {'created_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S"),'changed_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S") }
    base_filters = [['process_public',FilterEqual,True]]
    base_order = ('created_on','desc')

    @expose('/guestProStep/<pk>')
    def guestProStep(self,pk):

        item = self.datamodel.get(pk)

        step1 = ProcessGenInput.objects(process_id=pk).first()
        
        rndfilenames = []

        if step1 is None:
            print("step1 is null")
            step1 = ProcessGenInput(process_id=pk,created_by=current_user.id)
            step1.save()

            #add default rnd file
            rndfile = open(os.path.join(os.path.dirname(__file__),'static/csv/test.csv'),'rb')
            onefile = mongoengine.fields.GridFSProxy()
            onefile.put(rndfile,content_type='csv',filename = 'test.csv')
            step1.rnd_seed_file.append(onefile)
            step1.save()

        rndfiles = step1.rnd_seed_file 
        for file in rndfiles:
            if hasattr(file,'name'):
                rndfilenames.append(file.name)

        if item.process_simple is True:
            return self.render_template('/process_simple.html',process_step1=step1,process_rndfilenames=json.dumps(rndfilenames),process_name=item.process_name,process_description=item.process_description)
        else:
            return self.render_template('/process_guest.html',process_step1=step1,process_rndfilenames=json.dumps(rndfilenames),process_name=item.process_name, process_description=item.process_description)

class GuestProcessCmpView(ModelView):

    datamodel = MongoEngineInterface(Process)
    list_template = 'list_process.html'
    list_title = "MSE Comparison"
    base_permissions = ['can_list']
    formatters_columns = {'created_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S"),'changed_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S") }

    list_columns = ['process_name','created_by', 'created_on', 'changed_by', 'changed_on','process_simple']
    base_filters = [['process_public',FilterEqual,True]]
    base_order = ('created_on','desc')

    @action("comparePro","Do Strategy Comparison on these records","Do you really want to?","fa-rocket")
    def comparePro(self, item):
        """
            do something with the item record
        """
        return self.render_template('/stgCompare.html')

class ProcessView(ModelView):

    datamodel = ProcessOrMongoEngineInterface(Process)

    list_template = 'list_process_editable.html'

    label_columns = {'pro_name': 'Process Name'}

    add_columns =  ['process_name','process_description']
    edit_columns =  ['process_name','process_description']
    list_columns = ['pro_name','created_by', 'created_on', 'changed_by', 'changed_on','is_public','is_simple']
    formatters_columns = {'created_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S"),'changed_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S") }
    base_order = ('process_public','desc')

    def pre_add(self, item):
        item.created_by = current_user.id
        item.changed_by = current_user.id
        item.process_public = False
        item.process_simple = True

    def pre_update(self, item):
        item.changed_by = current_user.id
        item.changed_on = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def pre_delete(self, item):
        print(item.id)
        step1 = ProcessGenInput.objects(process_id=item.id).first()
        step1.delete()

    @expose('/showProStep/<pk>')
    @has_access
    def showProStep(self,pk):

        item = self.datamodel.get(pk)

        step1 = ProcessGenInput.objects(process_id=pk).first()

        rndfilenames = []

        if step1 is None:
            print("step1 is null")
            
            #############################################################
            #   read from global_settings                               #
            #############################################################

            global_settings = GlobalSettings.objects.first()

            step1 = ProcessGenInput(process_id=pk,created_by=current_user.id)                       

            step1.stock1_model_type = global_settings.stock1_model_type
            step1.time_step = global_settings.time_step
            step1.start_projection = global_settings.start_projection
            step1.short_term_mgt = global_settings.short_term_mgt
            step1.short_term_unit = global_settings.short_term_unit
            step1.long_term_mgt = global_settings.long_term_mgt
            step1.long_term_unit = global_settings.long_term_unit
            step1.stock_per_mgt_unit = global_settings.stock_per_mgt_unit
            step1.mixing_pattern = global_settings.mixing_pattern
            step1.last_age = global_settings.last_age
            step1.no_of_interations = global_settings.no_of_interations
            step1.rnd_seed_setting = global_settings.rnd_seed_setting

            step1.simple_spawning = global_settings.simple_spawning

            step1.recruitTypeStock1 = global_settings.recruitTypeStock1
            step1.formulaStock1 = global_settings.formulaStock1
            step1.fml1MbhmSSB0 = global_settings.fml1MbhmSSB0
            step1.fml1MbhmR0 = global_settings.fml1MbhmR0
            step1.fml1MbhmSteep = global_settings.fml1MbhmSteep
            step1.cv1Recruit = global_settings.cv1Recruit

            step1.recruitTypeStock2 = global_settings.recruitTypeStock2
            step1.formulaStock2 = global_settings.formulaStock2
            step1.fml2MbhmSSB0 = global_settings.fml2MbhmSSB0
            step1.fml2MbhmR0 = global_settings.fml2MbhmR0
            step1.fml2MbhmSteep = global_settings.fml2MbhmSteep
            step1.cv2Recruit = global_settings.cv2Recruit

            step1.save()            


            #add default rnd file
            rndfile = open(os.path.join(os.path.dirname(__file__),'static/csv/test.csv'),'rb')
            onefile = mongoengine.fields.GridFSProxy()
            onefile.put(rndfile,content_type='csv',filename = 'test.csv')
            step1.rnd_seed_file.append(onefile)
            step1.save()

        rndfiles = step1.rnd_seed_file 
        for file in rndfiles:
            if hasattr(file,'name'):
                rndfilenames.append(file.name)
            #print("===========%s"%step1[0].rnd_seed_file.filename)

        if item.process_simple is True:
            return self.render_template('/process_simple.html',process_step1=step1,process_rndfilenames=json.dumps(rndfilenames),process_name=item.process_name, process_description=item.process_description)
        else:
            return self.render_template('/process.html',process_step1=step1,process_rndfilenames=json.dumps(rndfilenames),process_name=item.process_name, process_description=item.process_description)

class ProcessCmpView(ModelView):

    datamodel = ProcessOrMongoEngineInterface(Process)
    list_template = 'list_process.html'
    list_title = "MSE Comparison"
    base_permissions = ['can_list']
    formatters_columns = {'created_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S"),'changed_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S") }

    list_columns = ['process_name','created_by', 'created_on', 'changed_by', 'changed_on','process_simple']

    @action("comparePro","Do Strategy Comparison on these records","Do you really want to?","fa-rocket")
    def comparePro(self, item):
        """
            do something with the item record
        """
        return self.render_template('/stgCompare.html')

"""
class AdvancedMseView(BaseView):

    default_view = "advancedMse"

    @expose('/advancedMse/')
    @has_access
    def advancedMse(self):

        return self.render_template('/advancedMse.html')
"""

class AdvancedMseView(ModelView):

    datamodel = ProcessOrMongoEngineInterface(Process)
    list_template = 'advanced_process.html'
    list_title = "Advanced MSE"
    base_permissions = ['can_list']
    formatters_columns = {'created_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S"),'changed_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S") }

    list_columns = ['advance_compare','process_name','created_by', 'created_on', 'changed_by', 'changed_on','process_simple']

class ProStepView(BaseView):

    route_base = "/prostepview"

    ALLOWED_RND_EXTENSIONS = set(['csv'])

    def allowed_file(self,filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in self.ALLOWED_RND_EXTENSIONS

    #process step1 : rnd file upload
    @expose('/step1/<string:pk>', methods = ['PUT'])
    @has_access
    def step1(self,pk):
    	if request.method == 'PUT':
    		pgi = ProcessGenInput.objects(id=pk).first()
    		pgi.time_step = request.form["time_step"]
    		pgi.start_projection = request.form["start_projection"]
    		pgi.short_term_mgt = request.form["short_term_mgt"]
    		pgi.short_term_unit = request.form["short_term_unit"]
    		pgi.long_term_mgt = request.form["long_term_mgt"]
    		pgi.long_term_unit = request.form["long_term_unit"]
    		pgi.stock_per_mgt_unit = request.form["stock_per_mgt_unit"]
    		pgi.mixing_pattern = request.form["mixing_pattern"]
    		pgi.last_age = request.form["last_age"]
    		pgi.no_of_interations = request.form["no_of_interations"]
    		pgi.save()

    	return Response(json.dumps({'status':1}), mimetype='application/json')

    #process step2 
    @expose('/step2/<string:pk>', methods = ['PUT'])
    @has_access
    def step2(self,pk):
    	if request.method == 'PUT':
    		pgi = ProcessGenInput.objects(id=pk).first()
    		pgi.unit1to1 = request.form["unit1to1"]
    		pgi.unit1to2 = request.form["unit1to2"]
    		pgi.unit2to1 = request.form["unit2to1"]
    		pgi.unit2to2 = request.form["unit2to2"]
    		pgi.save()

    	return Response(json.dumps({'status':1}), mimetype='application/json')

    #process step3 
    @expose('/step3/<string:pk>', methods = ['PUT'])
    @has_access
    def step3(self,pk):
    	populist = {}
    	if request.method == 'PUT':
    		pgi = ProcessGenInput.objects(id=pk).first()
    		pgi.stock1_model_type = request.form["stock1_model_type"]
    		pgi.stock1_filepath = request.form["stock1_filepath"]
    		pgi.stock2_model_type = request.form["stock2_model_type"]
    		pgi.stock2_filepath = request.form["stock2_filepath"]
    		pgi.save()

    	#return jsonify(pgi.to_json())
    	return Response(pgi.to_json(), mimetype='application/json')

    #process step4 
    @expose('/step4/<string:pk>', methods = ['PUT'])
    @has_access
    def step4(self,pk):
    	if request.method == 'PUT':
    		pgi = ProcessGenInput.objects(id=pk).first()
    		originlist = request.get_json()
    		populist = []
    		
    		for popu in originlist:
    			inipopu = GIIniPopulation()
    			inipopu.age_1 = int(popu['age_1'])
    			inipopu.stock_1_mean = float(popu['stock_1_mean'])
    			inipopu.cv_1 = float(popu['cv_1'])
    			inipopu.stock_2_mean = float(popu['stock_2_mean'])
    			inipopu.cv_2 = float(popu['cv_2'])
    			populist.append(inipopu)    			
    		
    		pgi.iniPopu = populist
    		pgi.save()

    	return Response(json.dumps({'status':1}), mimetype='application/json')

    @expose('/step5/<string:pk>', methods = ['PUT'])
    @has_access
    def step5(self,pk):
        if request.method == 'PUT':
            pgi = ProcessGenInput.objects(id=pk).first()
            originlist = request.get_json()
            biolist = []
            
            for origin in originlist:
                bioparam = BioParameter()
                bioparam.age_1 = int(origin['age_1'])
                bioparam.weight_at_age_1 = float(origin['weight_at_age_1'])
                bioparam.fec_at_age_1 = float(origin['fec_at_age_1'])
                bioparam.weight_at_age_2 = float(origin['weight_at_age_2'])
                bioparam.fec_at_age_2 = float(origin['fec_at_age_2'])
                biolist.append(bioparam)    			
    		
            pgi.bioParam = biolist
            pgi.save()
        return Response(json.dumps({'status':1}), mimetype='application/json')

    #process step6
    @expose('/step6/<string:pk>', methods = ['PUT'])
    @has_access
    def step6(self,pk):
        if request.method == 'PUT':
            pgi = ProcessGenInput.objects(id=pk).first()    		
            inputparam = request.get_json()

            pgi.simple_spawning = float(inputparam['simple_spawning']);

            mortalitylist = inputparam['mortality']

            morlist = []
    		
            for origin in mortalitylist:
                morParam = Mortality()
                morParam.age_1 = int(origin['age_1'])
                morParam.mean_1 = float(origin['mean_1'])
                morParam.cv_mean_1 = float(origin['cv_mean_1'])
                morParam.mean_2 = float(origin['mean_2'])
                morParam.cv_mean_2 = float(origin['cv_mean_2'])
                morlist.append(morParam)    			

            pgi.mortality = morlist
            pgi.save()

        return Response(json.dumps({'status':1}), mimetype='application/json')

    #process step7
    @expose('/step7/<string:pk>', methods = ['PUT'])
    @has_access
    def step7(self,pk):
        if request.method == 'PUT':
            pgi = ProcessGenInput.objects(id=pk).first()    		
            inputparam = request.get_json()

            pgi.recruitTypeStock1 = inputparam['recruitTypeStock1']
            pgi.formulaStock1 = inputparam['formulaStock1']
            pgi.fml1MbhmSSB0 = inputparam['fml1MbhmSSB0']
            pgi.fml1MbhmR0 = inputparam['fml1MbhmR0']
            pgi.fml1MbhmSteep = inputparam['fml1MbhmSteep']
            pgi.cv1Recruit = inputparam['cv1Recruit']

            pgi.recruitTypeStock2 = inputparam['recruitTypeStock2']
            pgi.formulaStock2 = inputparam['formulaStock2']
            pgi.fml2MbhmSSB0 = inputparam['fml2MbhmSSB0']
            pgi.fml2MbhmR0 = inputparam['fml2MbhmR0']
            pgi.fml2MbhmSteep = inputparam['fml2MbhmSteep']
            pgi.cv2Recruit = inputparam['cv2Recruit']

            pgi.save()

        return Response(json.dumps({'status':1}), mimetype='application/json')

    #process step8
    @expose('/step8/<string:pk>', methods = ['PUT'])
    @has_access
    def step8(self,pk):
    	if request.method == 'PUT':
    		pgi = ProcessGenInput.objects(id=pk).first()    		
    		inputparam = request.get_json()

    		pgi.bio_biomass_points = float(inputparam['bio_biomass_points']);
    		pgi.bio_harvest_radio = inputparam['bio_harvest_radio'];
    		pgi.bio_catch_mt = float(inputparam['bio_catch_mt']);
    		pgi.bio_f_percent = float(inputparam['bio_f_percent']);
    		pgi.hrt_harvest_rule = inputparam['hrt_harvest_rule'];
    		pgi.hrt_threshold1 = float(inputparam['hrt_threshold1']);
    		pgi.hrt_threshold2 = float(inputparam['hrt_threshold2']);
    		pgi.hrt_harvest_radio = inputparam['hrt_harvest_radio'];
    		pgi.hst_catch_thh1 = float(inputparam['hst_catch_thh1']);
    		pgi.hst_catch_thh2 = float(inputparam['hst_catch_thh2']);
    		pgi.hst_f_thh1 = float(inputparam['hst_f_thh1']);
    		pgi.hst_f_thh2 = float(inputparam['hst_f_thh2']);

    		pgi.save()

    	return Response(json.dumps({'status':1}), mimetype='application/json')

        #process step9
    @expose('/step9/<string:pk>', methods = ['PUT'])
    @has_access
    def step9(self,pk):
    	if request.method == 'PUT':
    		pgi = ProcessGenInput.objects(id=pk).first()    		
    		inputparam = request.get_json()

    		pgi.sec_recreational = float(inputparam['sec_recreational']);
    		pgi.sec_commercial = float(inputparam['sec_commercial']);
    		pgi.fishingStartDate = inputparam['fishingStartDate'];
    		pgi.fishingEndDate = inputparam['fishingEndDate'];

    		recStockList = inputparam['fleet_rec_stock']
    		comStockList = inputparam['fleet_com_stock']

    		fleet_rec_stock = []
    		fleet_com_stock = []
    		
    		for origin in recStockList:
    			stockParam = Allocation()
    			stockParam.stock = origin['stock']
    			stockParam.fleet = origin['fleet']
    			stockParam.allocation = float(origin['allocation'])
    			fleet_rec_stock.append(stockParam)    			
    		
    		pgi.fleet_rec_stock = fleet_rec_stock

    		for origin in comStockList:
    			stockParam = Allocation()
    			stockParam.stock = origin['stock']
    			stockParam.fleet = origin['fleet']
    			stockParam.allocation = float(origin['allocation'])
    			fleet_com_stock.append(stockParam)

    		pgi.fleet_com_stock = fleet_com_stock
    		pgi.save()

    	return Response(json.dumps({'status':1}), mimetype='application/json')

    #process step10
    @expose('/step10/<string:pk>', methods = ['PUT'])
    @has_access
    def step10(self,pk):
    	if request.method == 'PUT':
    		pgi = ProcessGenInput.objects(id=pk).first()    		
    		inputparam = request.get_json()

    		ratioRecRatioList = inputparam['ratio_rec_ratio']
    		ratioComRatioList = inputparam['ratio_com_ratio']
    		discardRecRatioList = inputparam['discard_rec_ratio']
    		discardComRatioList = inputparam['discard_com_ratio']

    		ratio_rec_ratio = []
    		ratio_com_ratio = []
    		discard_rec_ratio = []
    		discard_com_ratio = []
    		
    		for origin in ratioRecRatioList:
    			stockParam = LandingRatio()
    			stockParam.stock = origin['stock']
    			stockParam.state = origin['state']
    			stockParam.ratio = float(origin['ratio'])
    			ratio_rec_ratio.append(stockParam)
    		pgi.ratio_rec_ratio = ratio_rec_ratio

    		for origin in ratioComRatioList:
    			stockParam = LandingRatio()
    			stockParam.stock = origin['stock']
    			stockParam.state = origin['state']
    			stockParam.ratio = float(origin['ratio'])
    			ratio_com_ratio.append(stockParam)
    		pgi.ratio_com_ratio = ratio_com_ratio

    		for origin in discardRecRatioList:
    			stockParam = DiscardRatio()
    			stockParam.stock = origin['stock']
    			stockParam.fleet = origin['fleet']
    			stockParam.oc = origin['oc']
    			stockParam.ratio = float(origin['ratio'])
    			discard_rec_ratio.append(stockParam)
    		pgi.discard_rec_ratio = discard_rec_ratio

    		for origin in discardComRatioList:
    			stockParam = DiscardRatio()
    			stockParam.stock = origin['stock']
    			stockParam.fleet = origin['fleet']
    			stockParam.oc = origin['oc']
    			stockParam.ratio = float(origin['ratio'])
    			discard_com_ratio.append(stockParam)
    		pgi.discard_com_ratio = discard_com_ratio

    		pgi.save()

    	return Response(json.dumps({'status':1}), mimetype='application/json')


    ##############################################################################################
    # process step1 : rnd file upload, keep it for future use, implemented multiple files upload #
    ##############################################################################################
    @expose('/rndSeedFile/<string:pk>', methods = ['POST','DELETE'])
    @has_access
    def uploadRndSeedFile(self,pk):
        #app_stack = _app_ctx_stack or _request_ctx_stack
        #ctx = app_stack.top

        pgi = ProcessGenInput.objects(id=pk).first()
        pgi.update(changed_by=current_user.id,changed_on=datetime.datetime.now)
        
        if request.method == 'POST':
            files = request.files['file']

            if files:
                filename = secure_filename(files.filename)

                mime_type = files.content_type

                if not self.allowed_file(files.filename):
                    result = uploadfile(name=filename, type=mime_type, size=0, not_allowed_msg="File type not allowed")
                else:
                    onefile = mongoengine.fields.GridFSProxy()
                    onefile.put(files,content_type = 'csv',filename = files.filename)
                    pgi.rnd_seed_file.append(onefile)
                    #pgi.rnd_seed_file.replace(files,content_type = 'csv',filename = files.filename)
                    pgi.save()
                    #rnd = pgi.rnd_seed_file.read()
                    #print(pgi.rnd_seed_file.filename)
                    #print(pgi.rnd_seed_file.content_type)

        if request.method == 'DELETE':
            filename = request.get_json()['filename']
            for file in pgi.rnd_seed_file:
                if hasattr(file,'name'):
                    if filename==file.name:
                        file.delete()                        
                        pgi.rnd_seed_file.pop(file_index)
                        pgi.save()
                    #ProcessGenInput.objects(id=pk).update_one(pull__rnd_seed_file=file)

        return json.dumps({})

    #######################################################################################
    # keep it for future use, implemented multiple files upload                           #
    #######################################################################################
    @expose('/rndSeedFile/download/<pk>/<filename>')
    @has_access
    def download(self, pk, filename):
        item = ProcessGenInput.objects(id=pk).first()
        for file in item.rnd_seed_file:
            if(filename==file.name):
                response = make_response(file.read())
                response.headers["Content-Disposition"] = "attachment; filename={0}".format(filename)
                response.mimetype = 'text/csv'
                return response

    #######################################################################################
    # keep it for future use, implemented single file upload                              #
    #######################################################################################

    #process step3 : stock1 file upload
    @expose('/stock1file/<string:pk>', methods = ['POST','DELETE'])
    @has_access
    def uploadStock1File(self,pk):
        #app_stack = _app_ctx_stack or _request_ctx_stack
        #ctx = app_stack.top

        pgi = ProcessGenInput.objects(id=pk).first()
        pgi.update(changed_by=current_user.id,changed_on=datetime.datetime.now)
        
        if request.method == 'POST':
            files = request.files['file']

            if files:
                filename = secure_filename(files.filename)

                mime_type = files.content_type
                '''
                if not self.allowed_file(files.filename):
                    result = uploadfile(name=filename, type=mime_type, size=0, not_allowed_msg="File type not allowed")
                else:
                    pgi.stock1_filepath.replace(files,content_type = 'csv',filename = files.filename)
                    pgi.save()
                '''
                pgi.stock1_filepath.replace(files,content_type = mime_type,filename = files.filename)
                pgi.save()

        if request.method == 'DELETE':
            pgi.stock1_filepath.delete()

        return json.dumps({})

    #######################################################################################
    # keep it for future use, implemented single file upload                              #
    #######################################################################################

    @expose('/stock1file/download/<pk>')
    @has_access
    def downloadStock1File(self, pk):
        item = ProcessGenInput.objects(id=pk).first()
        file = item.stock1_filepath.read()
        response = make_response(file)
        response.headers["Content-Disposition"] = "attachment; filename={0}".format(item.stock1_filepath.filename)
        response.mimetype = item.stock1_filepath.content_type
        return response

    @expose('/getIniPopuTableData/<pk>')
    @has_access
    def getIniPopuTableData(self,pk):

        pgi = ProcessGenInput.objects(id=pk).first()
        if pgi.iniPopu != None and len(pgi.iniPopu)>0:
            return Response(pgi.to_json(), mimetype='application/json')

        else:
            global_settings = GlobalSettings.objects.first()                     

            pgi.iniPopu = global_settings.iniPopu

            pgi.save()

            return Response(pgi.to_json(), mimetype='application/json')

    @expose('/getBioParamTableData/<pk>')
    @has_access
    def getBioParamTableData(self,pk):

        pgi = ProcessGenInput.objects(id=pk).first()

        if pgi.bioParam != None and len(pgi.bioParam)>0:
          	return Response(pgi.to_json(), mimetype='application/json')

        else:
            global_settings = GlobalSettings.objects.first()                     

            pgi.bioParam = global_settings.bioParam

            pgi.save()

            return Response(pgi.to_json(), mimetype='application/json')

    @expose('/getMortalityTableData/<pk>')
    @has_access
    def getMortalityTableData(self,pk):

        pgi = ProcessGenInput.objects(id=pk).first()

        if pgi.mortality != None and len(pgi.mortality)>0:
          	return Response(pgi.to_json(), mimetype='application/json')

        else:
            global_settings = GlobalSettings.objects.first()                     

            pgi.mortality = global_settings.mortality

            pgi.save()

            return Response(pgi.to_json(), mimetype='application/json')

    @expose('/editTableData', methods = ['POST'])
    @has_access
    def editTableData(self):
        
        print(request.form["stock_1_mean"])

        return Response(json.dumps({'status':1}), mimetype='application/json')

    @expose('/getEchartData')
    @has_access
    def getEchartData(self):
        
        file_data = 'static/csv/F by Fleet.csv'

        df_E = pd.read_csv(os.path.join(os.path.dirname(__file__),file_data),usecols=['Yr','F_std','HL_E','HL_W'])

        return Response(df_E.to_json(orient='records'), mimetype='application/json')

    @expose('/getSsbAndFEchart')
    @has_access
    def getSsbAndFEchart(self):
        
        file_data = 'static/csv/ssbF.csv'

        df_E = pd.read_csv(os.path.join(os.path.dirname(__file__),file_data),usecols=['plot_years','plot_ssb','plot_F'])

        return Response(df_E.to_json(orient='records'), mimetype='application/json')

    @expose('/getMseInfo/<string:pid>')
    @has_access
    def getMseInfo(self,pid):
        
        pgi = ProcessGenInput.objects(process_id=pid).first() 
        print(pgi)           

        return Response(pgi.to_json(), mimetype='application/json')

    @expose('/propublic/<string:pk>', methods = ['PUT'])
    @has_access
    def propublic(self,pk):
        
        prs = Process.objects(id=pk).first()
        if request.form["public"]:
            prs.process_public = True if request.form["public"]=='true' else False
        prs.save()
        return Response(json.dumps({'status':1}), mimetype='application/json')

    @expose('/prosimple/<string:pk>', methods = ['PUT'])
    @has_access
    def prosimple(self,pk):
        
        prs = Process.objects(id=pk).first()
        if request.form["simple"]:
            prs.process_simple = True if request.form["simple"]=='true' else False
        prs.save()
        return Response(json.dumps({'status':1}), mimetype='application/json')

class StockFileView(ModelView):

    datamodel = MongoEngineInterface(StockFile)

    list_template = 'stock_file.html'

    label_columns = {'file_name': 'File Name','description':'Description','download': 'Download'}
    add_columns =  ['file', 'description']
    edit_columns = ['file', 'description']
    list_columns = ['file_name', 'description', 'created_by', 'created_on', 'changed_by', 'changed_on','is_default','download']
    show_fieldsets = [
        ('Info', {'fields': ['file_name', 'description', 'default_file', 'download']}),
        ('Audit', {'fields': ['created_by', 'created_on', 'changed_by', 'changed_on'], 'expanded': False})
    ]
    formatters_columns = {'created_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S"),'changed_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S") }
    base_permissions = ['can_list','can_add','can_delete','can_show','can_download']

    def pre_add(self, item):
        item.created_by = current_user.id

    def pre_update(self, item):
        item.changed_by = current_user.id

    @expose('/download/<pk>')
    @has_access
    def download(self, pk):
        item = self.datamodel.get(pk)
        file = item.file.read()
        response = make_response(file)
        response.headers["Content-Disposition"] = "attachment; filename={0}".format(item.file.name)
        return response



"""
    Application wide 404 error handler
"""
appbuilder.add_view(StockFileView,"Stock File", icon='fa-folder-open-o', category='Management',category_icon="fa-envelope")
appbuilder.add_view(ProcessView,"MSE Management", icon='fa-folder-open-o', category='MSE',category_icon="fa-envelope")
appbuilder.add_view(ProcessCmpView,"MSE Comparison", icon='fa-folder-open-o', category='MSE',category_icon="fa-envelope")
appbuilder.add_view(AdvancedMseView,"Advanced MSE", category='MSE', icon='fa-folder-open-o')
appbuilder.add_view_no_menu(ProStepView())

appbuilder.add_view(GuestProcessView,"Guest MSE Management", icon='fa-folder-open-o', category='Guest MSE',category_icon="fa-envelope")
appbuilder.add_view(GuestProcessCmpView,"Guest MSE Comparison", icon='fa-folder-open-o', category='Guest MSE',category_icon="fa-envelope")

appbuilder.security_cleanup()

@appbuilder.app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', base_template=appbuilder.base_template, appbuilder=appbuilder), 404

