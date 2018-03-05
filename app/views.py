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
import pandas as pd
import numpy as np
import json


"""
    Define you Views here
"""

class ProcessView(BaseView):


    @expose('/showProcess/')
    @has_access
    def showProcess(self):

        #rutils = RUtil()
        #rutils.runScript("app/static/rscript/rplots.r");

        return self.render_template('/process.html')

    ALLOWED_RND_EXTENSIONS = set(['txt'])


    def allowed_file(self,filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in self.ALLOWED_RND_EXTENSIONS

    #process step1 : rnd file upload
    @expose('/uploadRndSeedFile', methods = ['POST'])
    def uploadRndSeedFile(self):
        
        if request.method == 'POST':
            files = request.files['file']

        if files:
            filename = secure_filename(files.filename)
            #filename = gen_file_name(filename)
            mime_type = files.content_type
            print(filename)

            if not self.allowed_file(files.filename):
                result = uploadfile(name=filename, type=mime_type, size=0, not_allowed_msg="File type not allowed")

        return json.dumps({"files": [result.get_file()]})

    @expose('/generalInput', methods = ['POST'])
    def getTableData(self):

        data = request.form['form-generalinput']
        print(data)

        return Response(json.dumps({'status':1}), mimetype='application/json')


    @expose('/getTableData')
    def getTableData(self):

        file_obs_E = '/Users/yli120/rfish/Tables/Obs and Pred Sum_E.csv'
        file_obs_W = '/Users/yli120/rfish/Tables/Obs and Pred Sum_W.csv'

        df_E = pd.read_csv(file_obs_E,usecols=['Year','Observed'])
        df_E = df_E.rename(index=str, columns={"Year": "E_Year", "Observed": "E_Observed"})
        df_W = pd.read_csv(file_obs_W,usecols=['Year','Observed'])
        df_W = df_W.rename(index=str, columns={"Year": "W_Year", "Observed": "W_Observed"})
        df_total = pd.concat([df_E,df_W],axis=1)
        #return jsonify(df_E.to_json(orient='records'))
        return Response(df_total.to_json(orient='records'), mimetype='application/json')

    @expose('/editTableData', methods = ['POST'])
    def editTableData(self):
        
        print(request.form["E_Year"])

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
appbuilder.add_view(ProcessView,"prcess", href='/processview/showProcess', category='Process View')


@appbuilder.app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', base_template=appbuilder.base_template, appbuilder=appbuilder), 404

