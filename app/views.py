from flask import render_template,jsonify,Response,request
from flask.ext.appbuilder import ModelView
from flask.ext.appbuilder.models.mongoengine.interface import MongoEngineInterface
from app import appbuilder
from flask_appbuilder import BaseView, expose, has_access
from app.rutils import *
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

        return self.render_template('/process.html')



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


"""
    Application wide 404 error handler
"""

appbuilder.add_view(ProcessView,"prcess", href='/processview/showProcess', category='Process View')


@appbuilder.app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', base_template=appbuilder.base_template, appbuilder=appbuilder), 404

