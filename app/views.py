from flask import render_template,jsonify,Response,request,make_response,flash,redirect
from flask.ext.appbuilder import ModelView
from flask.ext.appbuilder.models.mongoengine.interface import MongoEngineInterface
from flask_appbuilder.models.mongoengine.filters import FilterEqual,FilterEqualFunction
from flask_appbuilder.actions import action
from flask_appbuilder.security.mongoengine.models import User,RegisterUser
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
        stock1_filename = ''

        if step1 is None:
            print("step1 is null")
            step1 = ProcessGenInput(process_id=pk,created_by=current_user.id)
            step1.save()

            #no need to add default rnd file, when use derictly get from server
            """
            rndfile = open(os.path.join(os.path.dirname(__file__),'static/csv/test.csv'),'rb')
            onefile = mongoengine.fields.GridFSProxy()
            onefile.put(rndfile,content_type='csv',filename = 'test.csv')
            step1.rnd_seed_file.append(onefile)
            step1.save()
            """
        if step1.stock1_filepath :
            stock1_filename = step1.stock1_filepath.name
        rndfiles = step1.rnd_seed_file 
        for file in rndfiles:
            if hasattr(file,'name'):
                rndfilenames.append(file.name)

        if item.process_simple is True:
            return self.render_template('/process_guest.html',process_step1=step1,process_rndfilenames=json.dumps(rndfilenames),process_stock1filename=json.dumps(stock1_filename),process_name=item.process_name,process_description=item.process_description)
        else:
            return self.render_template('/process_guest.html',process_step1=step1,process_rndfilenames=json.dumps(rndfilenames),process_stock1filename=json.dumps(stock1_filename),process_name=item.process_name, process_description=item.process_description)

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
        stock1_filename = ''

        if step1 is None:
            print("step1 is null")
            
            #############################################################
            #   read from global_settings                               #
            #############################################################

            global_settings = GlobalSettings.objects.first()

            step1 = ProcessGenInput(process_id=pk,created_by=current_user.id)                       

            step1.stock1_model_type = global_settings.stock1_model_type
            step1.stock1_input_file_type = global_settings.stock1_input_file_type
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
            step1.sample_size = global_settings.sample_size

            step1.ip_cv_1 = global_settings.ip_cv_1
            step1.ip_cv_2 = global_settings.ip_cv_2
            step1.simple_spawning = global_settings.simple_spawning
            step1.nm_cv_1 = global_settings.nm_cv_1
            step1.nm_cv_2 = global_settings.nm_cv_2
            step1.nm_m = global_settings.nm_m

            step1.stock1_amount = global_settings.stock1_amount
            step1.stock2_amount = global_settings.stock2_amount
            step1.recruitTypeStock1 = global_settings.recruitTypeStock1
            step1.formulaStock1 = global_settings.formulaStock1
            step1.fromFmlStock1 = global_settings.fromFmlStock1
            step1.fml1MbhmSSB0 = global_settings.fml1MbhmSSB0
            step1.fml1MbhmR0 = global_settings.fml1MbhmR0
            step1.fml1MbhmSteep = global_settings.fml1MbhmSteep

            step1.bio_catch_mt = global_settings.ssb_msy
            step1.bio_f_percent = global_settings.f_msy
            step1.hrt_harvest_rule = global_settings.hrt_harvest_rule

            step1.sec_recreational = global_settings.sec_recreational
            step1.sec_commercial = global_settings.sec_commercial
            step1.sec_hire = global_settings.sec_hire
            step1.sec_private = global_settings.sec_private
            step1.sec_pstar = global_settings.sec_pstar
            step1.sec_act_com = global_settings.sec_act_com
            step1.sec_act_pri = global_settings.sec_act_pri
            step1.sec_act_hire = global_settings.sec_act_hire

            step1.mg4_season = global_settings.mg4_season

                #extral
            step1.extra_F = global_settings.extra_F

            step1.save()            


            #add default rnd file
            rndfile = open(os.path.join(os.path.dirname(__file__),'static/csv/seed.csv'),'rb')
            onefile = mongoengine.fields.GridFSProxy()
            onefile.put(rndfile,content_type='csv',filename = 'seed.csv')
            step1.rnd_seed_file.append(onefile)
            step1.save()

        if step1.stock1_filepath :
            stock1_filename = step1.stock1_filepath.name 
        print("===================")
        print(stock1_filename)
        print("===================")
        rndfiles = step1.rnd_seed_file 
        for file in rndfiles:
            if hasattr(file,'name'):
                rndfilenames.append(file.name)
            #print("===========%s"%step1[0].rnd_seed_file.filename)

        if item.process_simple is True:
            return self.render_template('/process_simple.html',process_step1=step1,process_rndfilenames=json.dumps(rndfilenames),process_stock1filename=json.dumps(stock1_filename),process_name=item.process_name, process_description=item.process_description)
        else:
            return self.render_template('/process.html',process_step1=step1,process_rndfilenames=json.dumps(rndfilenames),process_stock1filename=json.dumps(stock1_filename),process_name=item.process_name, process_description=item.process_description)

class ProcessCmpView(ModelView):

    datamodel = ProcessOrMongoEngineInterface(Process)
    list_template = 'list_process.html'
    list_title = "MSE Comparison"
    base_permissions = ['can_list']
    formatters_columns = {'created_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S"),'changed_on': lambda x: x.strftime("%Y-%m-%d %H:%M:%S") }

    list_columns = ['process_name','created_by', 'created_on', 'changed_by', 'changed_on','process_simple']

    @action("comparePro","Do Strategy Comparison on these records","Do you really want to?","fa-rocket")
    def comparePro(self, item):
        print("========================")
        print(item)
        print("========================")
        mseNames = []
        greenMeans = []
        totalCatchs = []
        catchVars = []
        terminalSSBs = []
        lowestSSBs = []
        for process in item:            
            pgi = ProcessGenInput.objects(process_id=process.id).first()
            result = MseResultList.objects(process_gen_id=str(pgi.id)).first()            
            mseNames.append(process.process_name)
            greenMeans.append(result.Year_to_green_mean)
            totalCatchs.append(result.total_catch_MSEcomp)
            catchVars.append(result.catch_var_MSEcomp)
            terminalSSBs.append(result.terminal_SSB_MSEcomp)
            lowestSSBs.append(result.lowest_SSB_MSEcomp)
        """
            do something with the item record
        """
        return self.render_template('/stgCompare.html',mseNames=json.dumps(mseNames),greenMeans=json.dumps(greenMeans),totalCatchs=json.dumps(totalCatchs)
            ,catchVars=json.dumps(catchVars),terminalSSBs=json.dumps(terminalSSBs),lowestSSBs=json.dumps(lowestSSBs))

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
            """
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
            """
            pgi.rnd_seed_setting = request.form["rnd_seed_setting"]
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
            pgi.stock1_input_file_type = request.form["stock1_input_file_type"]
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

            pgi.save()

        return Response(json.dumps({'status':1}), mimetype='application/json')

    #process step8
    @expose('/step8/<string:pk>', methods = ['PUT'])
    @has_access
    def step8(self,pk):
        if request.method == 'PUT':
            pgi = ProcessGenInput.objects(id=pk).first()    		
            inputparam = request.get_json()

            pgi.bio_f_percent = float(inputparam['bio_f_percent'])/0.75;

            pgi.save()

        return Response(json.dumps({'status':1}), mimetype='application/json')

        #process step9
    @expose('/step9/<string:pk>', methods = ['PUT'])
    @has_access
    def step9(self,pk):
        if request.method == 'PUT':
            pgi = ProcessGenInput.objects(id=pk).first()    		
            inputparam = request.get_json()

            pgi.sec_commercial = inputparam['sec_commercial'];
            pgi.sec_recreational = inputparam['sec_recreational'];
            pgi.sec_headboat = inputparam['sec_headboat'];
            pgi.sec_charterboat = inputparam['sec_charterboat'];
            pgi.sec_hire = inputparam['sec_hire'];
            pgi.sec_private = inputparam['sec_private'];
            pgi.sec_pstar = inputparam['sec_pstar'];
            pgi.sec_act_com = inputparam['sec_act_com'];
            pgi.sec_act_pri = inputparam['sec_act_pri'];
            pgi.sec_act_hire = inputparam['sec_act_hire'];

            pgi.save()

        return Response(json.dumps({'status':1}), mimetype='application/json')

    #process step10
    @expose('/step10/<string:pk>', methods = ['PUT'])
    @has_access
    def step10(self,pk):
    	if request.method == 'PUT':
    		pgi = ProcessGenInput.objects(id=pk).first()    		
    		

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
                    onefile.put(files,content_type = mime_type,filename = files.filename)
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

    @expose('/setDefault/<string:pk>', methods = ['PUT'])
    @has_access
    def setDefault(self,pk):
        
        stockFile = StockFile.objects(id=pk).first()
        print(stockFile)
        stockFile.default_file = True
        stockFile.save()
        return Response(json.dumps({'status':1}), mimetype='application/json')

    @expose('/getVisitors')
    def getVisitors(self):

        login_count = User.objects.sum('login_count')

        registed_count = User.objects.count()

        mse_count = Process.objects.count()

        return Response(json.dumps({'login_count':login_count,'registed_count':registed_count,'mse_count':mse_count}), mimetype='application/json')

    @expose('/getMesResult/<pro_gen_id>')
    @has_access
    def getMesResult(self,pro_gen_id):

        print(pro_gen_id)

        mseresult = MseResultList.objects(process_gen_id=pro_gen_id).first()

        print(mseresult)

        if mseresult!=None and mseresult.resultlist != None and len(mseresult.resultlist)>0:
            return Response(mseresult.to_json(), mimetype='application/json')

        return Response(json.dumps({}), mimetype='application/json')

class StockFileView(ModelView):

    datamodel = MongoEngineInterface(StockFile)

    list_template = 'stock_file.html'

    label_columns = {'file_name': 'File Name','ssb_msy':'SSB(msy)','f_msy':'F(msy)','description':'Description','download': 'Download'}
    add_columns =  ['file','ssb_msy','f_msy', 'description']
    edit_columns = ['file', 'description','f_msy', 'description']
    list_columns = ['file_name', 'description','ssb_msy','f_msy', 'created_by', 'created_on', 'changed_by', 'changed_on','is_default','download']
    show_fieldsets = [
        ('Info', {'fields': ['file_name','ssb_msy','f_msy', 'description', 'default_file', 'download']}),
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

