#install rmongo package
#####################################################
#install.packages("devtools")
#library(devtools)
#install_github("mongosoup/rmongodb")
#devtools::install_github("r4ss/r4ss",force=TRUE) #, ref="v1.23.1")
#install.packages("RJSONIO")
#install.packages("plyr")
#####################################################


#* @filter cors
cors <- function(res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  plumber::forward()
}

# This function connect to the database and get one MSE record from Mongodb,
# param: mse_id is the process_id which will get from python code.
getMSEInfo<-function(mse_id){
  
  library("rmongodb")
  #mongo.create(host = "127.0.0.1", name = "", username = "",password = "", db = "admin", timeout = 0L)
  result<-mongo.bson.empty()
  mongo <- mongo.create()
  if (mongo.is.connected(mongo)) {
    # read record,use mongo shell to find the value of process_id, replace it in mongo.oid.from.string("5b02cc1b360e2e8f7f93d438"),then execute
    result <- mongo.find.one(mongo, "admin.process_gen_input", query=list('process_id' = mongo.oid.from.string(mse_id)))
  }
  mongo.destroy(mongo)
  return(result)
}

# This function is used for read random file
# param file_id is the ObjectId get from mse record
# param store_path is the directory where you want to store the file
getRondomFile<-function(file_id,store_path){
  library("rmongodb")
  mongo <- mongo.create()
  gridfs <- mongo.gridfs.create(mongo, "admin")
  gf <- mongo.gridfs.find(gridfs, query=list('_id' = mongo.oid.from.string(file_id)))
  
  if( !is.null(gf)){
    print(mongo.gridfile.get.length(gf))
    filename <- mongo.gridfile.get.filename(gf)
    print(filename)
    #store file 
    downfile <- file(paste(store_path,filename))
    mongo.gridfile.pipe(gf, downfile)
    mongo.gridfile.destroy(gf)
  }
  
  mongo.gridfs.destroy(gridfs)
}

# This function is used for save into MongoDb
storeGlobalSetting<-function(store_path,folder_name){
  setwd(store_path)
  require(r4ss)
  direct_ofl <- folder_name
  #setwd("/Users/yli120/")
  #direct_ofl <- "OFL"
  # Extract report Files from directories
  dat_ofl <- SS_output(dir = direct_ofl,printstats = T, covar=T, cormax=0.70, forecast=F,printhighcor=50, printlowcor=50)
  base<-dat_ofl
  ########################################################
  #Step 3 initial population, abundance unit 1000  #######
  ########################################################
  age_1<-base$agebins
  stock_1_mean<-base$natage[(base$natage$Area==1)&(base$natage$Yr==base$endyr)&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]
  cv_N_1<-rep(0.2,length(base$agebins))
  stock_2_mean<-base$natage[(base$natage$Area==2)&(base$natage$Yr==base$endyr)&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]
  cv_N_2<-rep(0.2,length(base$agebins))
  iniPopu<-cbind(age_1,t(stock_1_mean),cv_N_1,t(stock_2_mean),cv_N_2)
  colnames(iniPopu) <- c("age_1", "stock_1_mean", "cv_1", "stock_2_mean", "cv_2")
  library("RJSONIO")
  library("plyr")
  modified <- list(unname(alply(iniPopu, 1, identity)))
  iniPopuJson<-toJSON(unname(alply(iniPopu,1,identity)))
  ########################################################
  #Step 3 ends                                     #######
  ########################################################
  
  ########################################################
  #Step 4 biological parameters weight unit kg     #######
  ########################################################
  ##In SS3 fleet 0 contains begin season pop WT, fleet -1 contains mid season pop WT, and fleet -2 contains maturity*fecundity
  # Number of eggs for each individual
  fec_at_age<-base$wtatage[(base$wtatage$Fleet==-2),as.character(base$agebins)]
  if(unique(base$wtatage$Bio_Pattern)==1){
    fec_at_age_1<-fec_at_age
    fec_at_age_2<-fec_at_age
  }
  
  # Biomass for each individual, unit mt
  weight_at_age<-base$wtatage[(base$wtatage$Fleet==0),as.character(base$agebins)]
  if(unique(base$wtatage$Bio_Pattern)==1){
    weight_at_age_1<-weight_at_age
    weight_at_age_2<-weight_at_age
  }
  
  bioPara<-cbind(age_1, t(weight_at_age_1),t(fec_at_age_1),t(weight_at_age_2),t(fec_at_age_2))
  colnames(bioPara) <- c("age_1", "weight_at_age_1", "fec_at_age_1", "weight_at_age_2", "fec_at_age_2")
  #modified <- list(unname(alply(iniPopu, 1, identity)))
  bioParamJson<-toJSON(unname(alply(bioPara,1,identity)))
  ########################################################
  #Step 4 ends                                     #######
  ########################################################
  
  ########################################################
  #Step 5 Natural Mortality                        #######
  ########################################################
  #Natural mortality
  #Age-specific natural mortality rates (M) for Gulf of Mexico red snapper assuming a
  #Lorenzen mortality curve rescaled to an average M = 0.0943. The column labeled M represents
  #the average natural mortality experienced from July 1-June 30 (i.e., a birth year). The label Adj.
  #M indicates the values used in the SS3 model to account for SS advancing age on January 1.
  
  M<-base$M_at_age[(base$M_at_age$Year==base$endyr),as.character(base$agebins)]
  for(i.M in 2:length(M)) {
    if(is.na(M[i.M])){
      M[i.M]=M[i.M-1]
    }
  }
  
  if(unique(base$M_at_age$Bio_Pattern)==1){
    M_1<-M
    M_2<-M
  }
  
  cv_M_1<-rep(0.2,length(base$agebins))
  cv_M_2<-rep(0.2,length(base$agebins))
  
  #Step 5 natural mortality
  natM<-cbind(age_1, t(M_1),cv_M_1,t(M_2),cv_M_2)
  colnames(natM) <- c("age_1","mean_1", "cv_mean_1", "mean_2", "cv_mean_2")
  mortalityParamJson<-toJSON(unname(alply(natM,1,identity)))
  simple_spawning<-0.5
  ########################################################
  #Step 5 ends                                     #######
  ########################################################
  
  ########################################################
  #Step 6 Recruitment                              #######
  ########################################################
  
  # if historical 20 year recruitments.
  Rhist_1<-base$natage[(base$natage$Area==1)&(base$natage$Yr<=base$endyr)&(base$natage$Yr>(base$endyr-20))&(base$natage$`Beg/Mid`=="B"),"0"]
  Rhist_2<-base$natage[(base$natage$Area==2)&(base$natage$Yr<=base$endyr)&(base$natage$Yr>(base$endyr-20))&(base$natage$`Beg/Mid`=="B"),"0"]
  
  Rhist_1_mean<-mean(Rhist_1)
  Rhist_1_sd<-sd(Rhist_1)
  Rhist_1_median<-median(Rhist_1)
  Rhist_1_q1<-quantile(Rhist_1,0.25)
  Rhist_1_q3<-quantile(Rhist_1,0.75)
  
  Rhist_2_mean<-mean(Rhist_2)
  Rhist_2_sd<-sd(Rhist_2)
  Rhist_2_median<-median(Rhist_2)
  Rhist_2_q1<-quantile(Rhist_2,0.25)
  Rhist_2_q3<-quantile(Rhist_2,0.75)
  
  #recruitment, read parameter
  dat6<- base$parameters
  steepness<-base$parameters[base$parameters$Label=="SR_BH_steep","Value"]
  R0<-exp(base$parameters[base$parameters$Label=="SR_LN(R0)","Value"]) #unit 1000
  sigma_R<-base$parameters[base$parameters$Label=="SR_sigmaR","Value"] #standard deviation of logged recruitment
  R_offset_para<-base$parameters[base$parameters$Label=="SR_envlink","Value"]
  
  SSB0_1<-base$Dynamic_Bzero[(base$Dynamic_Bzero$Era=="VIRG"),"SSB_area1"]
  SSB0_2<-base$Dynamic_Bzero[(base$Dynamic_Bzero$Era=="VIRG"),"SSB_area2"]
  R0_1<-base$natage[(base$natage$Area==1)&(base$natage$Era=="VIRG")&(base$natage$`Beg/Mid`=="B"),"0"]
  R0_2<-base$natage[(base$natage$Area==2)&(base$natage$Era=="VIRG")&(base$natage$`Beg/Mid`=="B"),"0"]
  
  ########################################################
  #Step 6 End                                      #######
  ########################################################

  library("rmongodb")
  mongo <- mongo.create(db = "fishery")
  start_projection <- as.Date('2017/01/01')
  jsondata <- paste('{"stock1_model_type":"1","time_step":"Y","start_projection":"',start_projection,'","short_term_mgt":15,"short_term_unit":"Y","long_term_mgt":60,"long_term_unit":"Y","stock_per_mgt_unit":2,"mixing_pattern":"0","last_age":20,"no_of_interations":100,"rnd_seed_setting":"0","iniPopu":',iniPopuJson
                    ,',"bioParam":',bioParamJson,',"mortality":',mortalityParamJson,',"simple_spawning":',simple_spawning
                    ,',"recruitTypeStock1":"2","formulaStock1":"3","fml1MbhmSSB0":',SSB0_1,',"fml1MbhmR0":',R0_1,',"fml1MbhmSteep":',steepness,',"cv1Recruit":',30
                    ,',"recruitTypeStock2":"2","formulaStock2":"3","fml2MbhmSSB0":',SSB0_2,',"fml2MbhmR0":',R0_2,',"fml2MbhmSteep":',steepness,',"cv2Recruit":',30
                    ,'}',sep = "")
  global_content<-mongo.bson.from.JSON(jsondata)
  mongo.remove(mongo,"fishery.global_settings")
  mongo.insert(mongo,"fishery.global_settings",global_content)

}

# This function is used for save global zip file and unzip it, then invoke analytic function to get value and save into global settings.
# param file_id is the ObjectId get from mse record
# param store_path is the directory where you want to store the file
#' @param file_id The gridfs file id
#' @param store_path file saved directory
#' @serializer unboxedJSON
#' @post /defaultFile
function(file_id,store_path){
  library("rmongodb")
  mongo <- mongo.create(db = "fishery")
  gridfs <- mongo.gridfs.create(mongo, "fishery")
  gf <- mongo.gridfs.find(gridfs, query=list('_id' = mongo.oid.from.string(file_id)))
  
  if( !is.null(gf)){
    #print(mongo.gridfile.get.length(gf))
    filename <- mongo.gridfile.get.filename(gf)
    print(filename)
    #store file 
    setwd(store_path)
    downfile <- file(filename)
    mongo.gridfile.pipe(gf, downfile)
    mongo.gridfile.destroy(gf)
    unzip(filename)
  }
  mongo.gridfs.destroy(gridfs)
  split_filename<-unlist(strsplit(filename, "\\."))
  storeGlobalSetting(store_path,split_filename[1])
}

#* Echo back the input,for testing the service is ready or not
#* @param msg The message to echo
#* @get /echo
function(msg=""){
  list(msg = paste0("The message is: '", msg, "'"))
}

if(FALSE){
    ####################################################################
    ##  The following codes illustrate how to get value from mongodb  ##
    ##  based on getMSEInfo function.                                 ##
    ####################################################################
    #invoke Rmongo to get data from mongodb,"5b02cc1b360e2e8f7f93d438", try to get this id from mongo client
    mse_info <- getMSEInfo("5b7ad05f360e2e52e8d51737")
    #see all the values inside
    print(mse_info)
    #get a specific value
    print(mongo.bson.value(mse_info, "mixing_pattern"))
    print(as.Date(mongo.bson.value(mse_info, "start_projection")))
    #get a list
    iniPopuList <-mongo.bson.value(mse_info, "iniPopu")
    #get a value in the list
    print(iniPopuList$`0`$age_1)
    #iterate the list to get all value
    for(i in iniPopuList){print(i)}
    #get rnd_seed_file then you can use R to read the file as you want
    #rnd_file<-mongo.bson.value(mse_info, "rnd_seed_file")$'0'
    #print(as.character(rnd_file))
    #rondomFile<-getGridfsFile(as.character(rnd_file),"/Users/yli120/Documents/") 
    #need to name plumber function as saveGlobalFile before testing
    #saveGlobalFile('5b72d902360e2e20451dc0e4',"/Users/yli120/")

    
    
    
}

