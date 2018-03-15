from flask import render_template,jsonify,Response,request,make_response
from flask.ext.appbuilder import ModelView
from flask.ext.appbuilder.models.mongoengine.interface import MongoEngineInterface
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

    @expose('/showProStep/<pk>')
    @has_access
    def showProStep(self,pk):

        item = self.datamodel.get(pk)

        step1 = ProcessGenInput.objects(process_id=pk)

        if len(step1) == 0:
            print("step1 is null")
            step1 = ProcessGenInput(process_id=pk,created_by=current_user.id)
            step1.save()
        else:
        	rndfile = step1[0].rnd_seed_file 
        	rndfilename = ""
        	if rndfile is None:
        		rndfilename = step1[0].rnd_seed_file.filename
            #print("===========%s"%step1[0].rnd_seed_file.filename)

        return self.render_template('/process.html',process_step1=step1[0],process_name=item.process_name, process_description=item.process_description)

class ProStepView(BaseView):

    route_base = "/prostepview"

    ALLOWED_RND_EXTENSIONS = set(['txt'])

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
    	if request.method == 'PUT':
    		pgi = ProcessGenInput.objects(id=pk).first()
    		pgi.stock1_model_type = request.form["stock1_model_type"]
    		pgi.stock1_filepath = request.form["stock1_filepath"]
    		pgi.stock2_model_type = request.form["stock2_model_type"]
    		pgi.stock2_filepath = request.form["stock2_filepath"]
    		pgi.save()

    	return Response(json.dumps({'status':1}), mimetype='application/json')

    #process step3 
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
                    pgi.rnd_seed_file.replace(files,content_type = 'txt',filename = files.filename)
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
        response.headers["Content-Disposition"] = "attachment; filename={0}".format(item.rnd_seed_file.name)
        return response

    @expose('/generalInput', methods = ['POST'])
    @has_access
    def getTableData(self):

        data = request.form['form-generalinput']
        print(data)

        return Response(json.dumps({'status':1}), mimetype='application/json')


    @expose('/getTableData')
    @has_access
    def getTableData(self):

        file_obs_E = '/Users/yli120/rfish/Tables/Obs and Pred Sum_E.csv'
        file_obs_W = '/Users/yli120/rfish/Tables/Obs and Pred Sum_W.csv'

        df_E = pd.read_csv(file_obs_E,usecols=['Year','Observed','Expected'])
        df_E = df_E.rename(index=str, columns={"Year": "age_1", "Observed": "stock_1_mean", "Expected": "cv_1"})
        df_W = pd.read_csv(file_obs_W,usecols=['Observed','Expected'])
        df_W = df_W.rename(index=str, columns={"Observed": "stock_2_mean", "Expected": "cv_2"})
        df_total = pd.concat([df_E,df_W],axis=1)
        #return jsonify(df_E.to_json(orient='records'))
        return Response(df_total.to_json(orient='records'), mimetype='application/json')

    @expose('/editTableData', methods = ['POST'])
    @has_access
    def editTableData(self):
        
        print(request.form["stock_1_mean"])

        return Response(json.dumps({'status':1}), mimetype='application/json')


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
appbuilder.add_view(ProcessView,"MSE Test Scenarios", icon='fa-folder-open-o', category='MSE',category_icon="fa-envelope")
appbuilder.add_view_no_menu(ProStepView())

@appbuilder.app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', base_template=appbuilder.base_template, appbuilder=appbuilder), 404

