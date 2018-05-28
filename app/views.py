from flask import render_template,jsonify,Response,request,make_response,flash,redirect
from flask.ext.appbuilder import ModelView
from flask.ext.appbuilder.models.mongoengine.interface import MongoEngineInterface
from flask_appbuilder.actions import action
from app import appbuilder
from flask_appbuilder import BaseView, expose, has_access
from flask_login import current_user
from werkzeug import secure_filename
from app.models import *
from app.rutils import *
from app.fileUtils import *
from bson import json_util
import pandas as pd
import numpy as np
import json
import datetime
import os
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

class ProcessView(ModelView):

    datamodel = MongoEngineInterface(Process)

    label_columns = {'pro_name': 'Process Name'}

    add_columns =  ['process_name','process_description']
    edit_columns =  ['process_name','process_description']
    list_columns = ['pro_name','created_by', 'created_on', 'changed_by', 'changed_on']

    def pre_add(self, item):
        item.created_by = current_user.id

    def pre_update(self, item):
        item.changed_by = current_user.id

    def pre_delete(self, item):
        print(item.id)
        step1 = ProcessGenInput.objects(process_id=item.id).first()
        step1.delete()

    @expose('/showProStep/<pk>')
    @has_access
    def showProStep(self,pk):

        item = self.datamodel.get(pk)

        step1 = ProcessGenInput.objects(process_id=pk).first()

        if step1 is None:
            print("step1 is null")
            step1 = ProcessGenInput(process_id=pk,created_by=current_user.id)
            step1.save()

            #add default rnd file
            rndfile = open(os.path.join(os.path.dirname(__file__),'static/csv/test.csv'),'rb')
            step1.rnd_seed_file.put(rndfile,content_type='csv',filename = 'test.csv')
            step1.save()

        else:
        	rndfile = step1.rnd_seed_file 
        	rndfilename = ""
        	if rndfile is None:
        		rndfilename = step1[0].rnd_seed_file.filename
            #print("===========%s"%step1[0].rnd_seed_file.filename)

        return self.render_template('/process.html',process_step1=step1,process_name=item.process_name, process_description=item.process_description)

class ProcessCmpView(ModelView):

    datamodel = MongoEngineInterface(Process)
    list_template = 'list_process.html'
    base_permissions = ['can_list']

    list_columns = ['process_name','created_by', 'created_on', 'changed_by', 'changed_on']

    @action("comparePro","Do Strategy Comparison on these records","Do you really want to?","fa-rocket")
    def comparePro(self, item):
        """
            do something with the item record
        """
        return self.render_template('/stgCompare.html')

class AdvancedMseView(BaseView):

    default_view = "advancedMse"

    @expose('/advancedMse/')
    @has_access
    def advancedMse(self):

        return self.render_template('/advancedMse.html')


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
    			bioParam = BioParameter()
    			bioParam.age_1 = int(origin['age_1'])
    			bioParam.maturity_stock_1 = float(origin['maturity_stock_1'])
    			bioParam.maturity_stock_2 = float(origin['maturity_stock_2'])
    			bioParam.fecundity = float(origin['fecundity'])
    			biolist.append(bioParam)    			
    		
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

    		pgi.mortality_complexity = int(inputparam['mortality_complexity']);
    		pgi.simple_mean = float(inputparam['simple_mean']);
    		pgi.simple_cv = float(inputparam['simple_cv']);
    		pgi.simple_spawning = float(inputparam['simple_spawning']);

    		mortalitylist = inputparam['mortality']

    		morlist = []
    		
    		for origin in mortalitylist:
    			morParam = Mortality()
    			morParam.age_1 = int(origin['age_1'])
    			morParam.mean = float(origin['mean'])
    			morParam.cv = float(origin['cv'])
    			morParam.spawning = float(origin['spawning'])
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
    		pgi.historySt1 = inputparam['recruitTypeStock1']
    		pgi.hst1_lower = inputparam['hst1_lower']
    		pgi.hst1_median = inputparam['hst1_median']
    		pgi.hst1_mean = inputparam['hst1_mean']
    		pgi.hst1_upper = inputparam['hst1_upper']
    		pgi.hst1_other = inputparam['hst1_other']
    		pgi.hst1_cal = inputparam['hst1_cal']
    		pgi.formulaStock1 = inputparam['formulaStock1']
    		pgi.fml1Bmalpha1 = inputparam['fml1Bmalpha1']
    		pgi.fml1Bmbeta1 = inputparam['fml1Bmbeta1']
    		pgi.fml1Rmalpha1 = inputparam['fml1Rmalpha1']
    		pgi.fml1Rmbeta1 = inputparam['fml1Rmbeta1']
    		pgi.fml1MbhmSSB0 = inputparam['fml1MbhmSSB0']
    		pgi.fml1MbhmR0 = inputparam['fml1MbhmR0']
    		pgi.fml1MbhmSteep = inputparam['fml1MbhmSteep']
    		pgi.auto1R0 = inputparam['auto1R0']
    		pgi.auto1h = inputparam['auto1h']
    		pgi.auto1Rave = inputparam['auto1Rave']
    		pgi.cv1Recruit = inputparam['cv1Recruit']

    		pgi.recruitTypeStock2 = inputparam['recruitTypeStock2']
    		pgi.historySt2 = inputparam['recruitTypeStock2']
    		pgi.hst2_lower = inputparam['hst2_lower']
    		pgi.hst2_median = inputparam['hst2_median']
    		pgi.hst2_mean = inputparam['hst2_mean']
    		pgi.hst2_upper = inputparam['hst2_upper']
    		pgi.hst2_other = inputparam['hst2_other']
    		pgi.hst2_cal = inputparam['hst2_cal']
    		pgi.formulaStock2 = inputparam['formulaStock2']
    		pgi.fml2Bmalpha1 = inputparam['fml2Bmalpha1']
    		pgi.fml2Bmbeta1 = inputparam['fml2Bmbeta1']
    		pgi.fml2Rmalpha1 = inputparam['fml2Rmalpha1']
    		pgi.fml2Rmbeta1 = inputparam['fml2Rmbeta1']
    		pgi.fml2MbhmSSB0 = inputparam['fml2MbhmSSB0']
    		pgi.fml2MbhmR0 = inputparam['fml2MbhmR0']
    		pgi.fml2MbhmSteep = inputparam['fml2MbhmSteep']
    		pgi.auto2R0 = inputparam['auto2R0']
    		pgi.auto2h = inputparam['auto2h']
    		pgi.auto2Rave = inputparam['auto2Rave']
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


    #process step1 : rnd file upload
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
                    pgi.rnd_seed_file.replace(files,content_type = 'csv',filename = files.filename)
                    pgi.save()
                    rnd = pgi.rnd_seed_file.read()
                    print(pgi.rnd_seed_file.filename)
                    print(pgi.rnd_seed_file.content_type)

        if request.method == 'DELETE':
            pgi.rnd_seed_file.delete()

        return json.dumps({})

    @expose('/rndSeedFile/download/<pk>')
    @has_access
    def download(self, pk):
        item = ProcessGenInput.objects(id=pk).first()
        file = item.rnd_seed_file.read()
        response = make_response(file)
        response.headers["Content-Disposition"] = "attachment; filename={0}".format(item.rnd_seed_file.filename)
        response.mimetype = 'text/csv'
        return response

    @expose('/getIniPopuTableData/<pk>')
    @has_access
    def getIniPopuTableData(self,pk):

        pgi = ProcessGenInput.objects(id=pk).first()
        if pgi.iniPopu != None and len(pgi.iniPopu)>0:
            return Response(pgi.to_json(), mimetype='application/json')

        else:
            file_obs_E = 'static/csv/Obs and Pred Sum_E.csv'
            file_obs_W = 'static/csv/Obs and Pred Sum_W.csv'

            df_E = pd.read_csv(os.path.join(os.path.dirname(__file__),file_obs_E),usecols=['Year','Observed','Expected'])
            df_E = df_E.rename(index=str, columns={"Year": "age_1", "Observed": "stock_1_mean", "Expected": "cv_1"})
            df_W = pd.read_csv(os.path.join(os.path.dirname(__file__),file_obs_W),usecols=['Observed','Expected'])
            df_W = df_W.rename(index=str, columns={"Observed": "stock_2_mean", "Expected": "cv_2"})
            df_total = pd.concat([df_E,df_W],axis=1)

            return Response(df_total.to_json(orient='records'), mimetype='application/json')

    @expose('/getBioParamTableData/<pk>')
    @has_access
    def getBioParamTableData(self,pk):

        pgi = ProcessGenInput.objects(id=pk).first()

        if pgi.bioParam != None and len(pgi.bioParam)>0:
          	return Response(pgi.to_json(), mimetype='application/json')

        else:
            file_obs_E = 'static/csv//Obs and Pred Sum_E.csv'
            file_obs_W = 'static/csv//Obs and Pred Sum_W.csv'

            df_E = pd.read_csv(os.path.join(os.path.dirname(__file__),file_obs_E),usecols=['Year','Observed','Expected'])
            df_E = df_E.rename(index=str, columns={"Year": "age_1", "Observed": "maturity_stock_1", "Expected": "maturity_stock_2"})
            df_W = pd.read_csv(os.path.join(os.path.dirname(__file__),file_obs_W),usecols=['Observed'])
            df_W = df_W.rename(index=str, columns={"Observed": "fecundity"})
            df_total = pd.concat([df_E,df_W],axis=1)            

            return Response(df_total.to_json(orient='records'), mimetype='application/json')

    @expose('/getMortalityTableData/<pk>')
    @has_access
    def getMortalityTableData(self,pk):

        pgi = ProcessGenInput.objects(id=pk).first()

        if pgi.mortality != None and len(pgi.mortality)>0:
          	return Response(pgi.to_json(), mimetype='application/json')

        else:
            print("in")
            file_obs_E = 'static/csv/Obs and Pred Sum_E.csv'
            file_obs_W = 'static/csv/Obs and Pred Sum_W.csv'

            df_E = pd.read_csv(os.path.join(os.path.dirname(__file__),file_obs_E),usecols=['Year','Observed','Expected'])
            df_E = df_E.rename(index=str, columns={"Year": "age_1", "Observed": "mean", "Expected": "cv"})
            df_W = pd.read_csv(os.path.join(os.path.dirname(__file__),file_obs_W),usecols=['Observed'])
            df_W = df_W.rename(index=str, columns={"Observed": "spawning"})
            df_total = pd.concat([df_E,df_W],axis=1)            

            return Response(df_total.to_json(orient='records'), mimetype='application/json')

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

class StockFileView(ModelView):

    datamodel = MongoEngineInterface(StockFile)

    label_columns = {'file_name': 'File Name','description':'Description','download': 'Download'}
    add_columns =  ['file', 'description']
    edit_columns = ['file', 'description']
    list_columns = ['file_name', 'description', 'download','created_by', 'created_on', 'changed_by', 'changed_on']
    show_fieldsets = [
        ('Info', {'fields': ['file_name', 'description', 'download']}),
        ('Audit', {'fields': ['created_by', 'created_on', 'changed_by', 'changed_on'], 'expanded': False})
    ]

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

appbuilder.security_cleanup()

@appbuilder.app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', base_template=appbuilder.base_template, appbuilder=appbuilder), 404

