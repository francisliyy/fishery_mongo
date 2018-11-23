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
# param: mse_id is the process_gen_id which will get from python code.
getMSEInfo<-function(mse_id){
  
  library("rmongodb")
  #mongo.create(host = "127.0.0.1", name = "", username = "",password = "", db = "admin", timeout = 0L)
  result<-mongo.bson.empty()
  mongo <- mongo.create()
  if (mongo.is.connected(mongo)) {
    # read record,use mongo shell to find the value of process_id, replace it in mongo.oid.from.string("5b02cc1b360e2e8f7f93d438"),then execute
    result <- mongo.find.one(mongo, "admin.process_gen_input", query=list('_id' = mongo.oid.from.string(mse_id)))
  }
  mongo.destroy(mongo)
  return(result)
}

# This function is used for read random file
# param file_id is the ObjectId get from mse record
# param store_path is the directory where you want to store the file
getRondomFile<-function(file_id,store_path){
  library("rmongodb")
  mongo <- mongo.create(host = "127.0.0.1", username = "",password = "", db = "admin")
  gridfs <- mongo.gridfs.create(mongo, "admin")
  gf <- mongo.gridfs.find(gridfs, query=list('_id' = mongo.oid.from.string("5bd1c626360e2e635192f199")))
  filename<-""
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
  return(filename)
}

# This function is used for save into MongoDb
storeGlobalSetting<-function(store_path,folder_name,ssb_msy,f_msy){
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
  ip_cv_1<-0.2
  ip_cv_2<-0.2
  cv_N_1<-rep(ip_cv_1,length(base$agebins))
  stock_2_mean<-base$natage[(base$natage$Area==2)&(base$natage$Yr==base$endyr)&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]
  cv_N_2<-rep(ip_cv_2,length(base$agebins))
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
  nm_cv_1<-0.2
  nm_cv_2<-0.2
  cv_M_1<-rep(nm_cv_1,length(base$agebins))
  cv_M_2<-rep(nm_cv_2,length(base$agebins))
  
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
  
  ########################################################
  #extra variable start                            #######
  ########################################################
  
  #F in the last three years, add up together not right
  hl_e_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_1']))
  hl_w_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_2']))
  ll_e_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_3']))
  ll_w_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_4']))
  mrip_e_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_5']))
  mrip_w_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_6']))
  hbt_e_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_7']))
  hbt_w_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_8']))
  comm_closed_e_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_9']))
  comm_closed_w_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_10']))
  rec_closed_e_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_11']))
  rec_closed_w_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_12']))
  shrimp_e_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_13']))
  shrimp_w_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_14']))
  
  extraF<-cbind(hl_e_pred_F, hl_w_pred_F,ll_e_pred_F,ll_w_pred_F,mrip_e_pred_F,mrip_w_pred_F,hbt_e_pred_F,hbt_w_pred_F,comm_closed_e_pred_F,comm_closed_w_pred_F,rec_closed_e_pred_F,rec_closed_w_pred_F,shrimp_e_pred_F,shrimp_w_pred_F)
  colnames(extraF) <- c("hl_e_pred_F","hl_w_pred_F", "ll_e_pred_F", "ll_w_pred_F","mrip_e_pred_F","mrip_w_pred_F", "hbt_e_pred_F", "hbt_w_pred_F","comm_closed_e_pred_F","comm_closed_w_pred_F", "rec_closed_e_pred_F", "rec_closed_w_pred_F","shrimp_e_pred_F","shrimp_w_pred_F")
  extraFJson<-toJSON(unname(alply(extraF,1,identity)))
  
  ########################################################
  #extra variable end                              #######
  ########################################################

  library("rmongodb")
  mongo <- mongo.create(host = "127.0.0.1", username = "",password = "", db = "admin")
  start_projection <- as.Date('2016/01/01')
  jsondata <- paste('{"stock1_model_type":"1","stock1_input_file_type":"1","time_step":"Y","start_projection":"',start_projection,'","short_term_mgt":3,"short_term_unit":"Y","long_term_mgt":20,"long_term_unit":"Y","stock_per_mgt_unit":2,"mixing_pattern":"0","last_age":20,"no_of_interations":100,"sample_size":1000,"rnd_seed_setting":"1","iniPopu":',iniPopuJson
                    ,',"ip_cv_1":',ip_cv_1,',"ip_cv_2":',ip_cv_2,',"bioParam":',bioParamJson,',"nm_cv_1":',nm_cv_1,',"nm_cv_2":',nm_cv_2,',"nm_m":"c","mortality":',mortalityParamJson,',"simple_spawning":',simple_spawning
                    ,',"stock1_amount":23,"stock2_amount":77,"recruitTypeStock1":"2","formulaStock1":"3","fml1MbhmSSB0":',0,',"fml1MbhmR0":',0,',"fml1MbhmSteep":',0
                    ,',"ssb_msy":',ssb_msy,',"f_msy":',f_msy,',"hrt_harvest_rule":"CF","sec_recreational":51,"sec_commercial":49,"sec_hire":43,"sec_private":57,"sec_pstar":42.7,"sec_act_com":0,"sec_act_pri":20,"sec_act_hire":20'
                    ,',"extra_F":',extraFJson,'}',sep = "")
  global_content<-mongo.bson.from.JSON(jsondata)
  mongo.remove(mongo,"admin.global_settings")
  mongo.insert(mongo,"admin.global_settings",global_content)

}

# This function is used for save global zip file and unzip it, then invoke analytic function to get value and save into global settings.
# param file_id is the ObjectId get from mse record
# param store_path is the directory where you want to store the file
#' @param file_id The gridfs file id
#' @param store_path file saved directory
#' @serializer unboxedJSON
#' @post /defaultFile
function(file_id,store_path,ssb_msy,f_msy){
  library("rmongodb")
  mongo <- mongo.create(host = "127.0.0.1", username = "",password = "", db = "admin")
  print(mongo.is.connected(mongo))
  gridfs <- mongo.gridfs.create(mongo, "admin")
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
  }else{
    print("in else")
  }
  mongo.gridfs.destroy(gridfs)
  split_filename<-unlist(strsplit(filename, "\\."))
  storeGlobalSetting(store_path,split_filename[1],ssb_msy,f_msy)
}
# This function is used for save global zip file and unzip it, then invoke analytic function to get value and save into global settings.
# param file_id is the ObjectId get from mse record
# param store_path is the directory where you want to store the file
#' @param store_path file saved directory
#' @serializer unboxedJSON
#' @post /runmse
function(store_path,seed_file,F_plan,comm,process_gen_id){
library("r4ss")

setwd("~/")

## directories
direct <- 'OFL'

##basic readin
base <- SS_output(dir = direct,printstats = T, covar=T, cormax=0.70, forecast=F,printhighcor=50, printlowcor=50)

##start year and end year
yr_1<-base$startyr
#endyear was used in Step 2
yr_term<-base$endyr

##age readin and setting initial population
#The following 5 rows were used in Step 2 and 3
#stock_1: East, stock_2: West
age_1<-base$agebins
stock_1_mean<-c(t(base$natage[(base$natage$Area==1)&(base$natage$Yr==base$endyr)&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]))
cv_N_1<-0.2
stock_2_mean<-c(t(base$natage[(base$natage$Area==2)&(base$natage$Yr==base$endyr)&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]))
cv_N_2<-0.2

#sum(stock_1_mean) #matches the SA report 4.1 Spawning Output 
#sum(stock_2_mean) #matches the SA report 4.1 Spawning Output 

#Step 3 initial population, abundance unit 1000
iniPopu<-cbind(age_1,stock_1_mean,stock_2_mean)
colnames(iniPopu) <- c("age", "stock_1_mean", "stock_2_mean")

##In SS3 fleet 0 contains begin season pop WT, fleet -1 contains mid season pop WT, and fleet -2 contains maturity*fecundity
# Number of eggs for each individual
fec_at_age<-c(t(base$wtatage[(base$wtatage$Fleet==-2),as.character(base$agebins)]))
if(unique(base$wtatage$Bio_Pattern)==1){
  fec_at_age_1<-fec_at_age
  fec_at_age_2<-fec_at_age
}

spawning_output_1<-stock_1_mean*fec_at_age_1*1000
spawning_output_2<-stock_2_mean*fec_at_age_2*1000
#sum(spawning_output_1) #matches the SA report 4.1 Spawning Output 
#sum(spawning_output_2) #matches the SA report 4.1 Spawning Output 

# Biomass for each individual, unit mt
weight_at_age<-c(t(base$wtatage[(base$wtatage$Fleet==0),as.character(base$agebins)]))
if(unique(base$wtatage$Bio_Pattern)==1){
  weight_at_age_1<-weight_at_age
  weight_at_age_2<-weight_at_age
}

#B_at_age_1<-stock_1_mean*weight_at_age_1 #biomass unit 1000*kg=mt
#B_at_age_2<-stock_2_mean*weight_at_age_2 #biomass unit 1000*kg=mt
#sum(B_at_age_1) #matches the SA report 4.1 Spawning Output
#sum(B_at_age_2) #matches the SA report 4.1 Spawning Output

#Step 4 biological parameters weight unit kg
bioPara<-cbind(age_1, weight_at_age_1,fec_at_age_1,weight_at_age_2,fec_at_age_2)
colnames(bioPara) <- c("age", "weight_at_age_Area1", "fec_at_age_Area1", "weight_at_age_Area2", "fec_at_age_Area2")

#Natural mortality
#Age-specific natural mortality rates (M) for Gulf of Mexico red snapper assuming a
#Lorenzen mortality curve rescaled to an average M = 0.0943. The column labeled M represents
#the average natural mortality experienced from July 1-June 30 (i.e., a birth year). The label Adj.
#M indicates the values used in the SS3 model to account for SS advancing age on January 1.

M<-c(t(base$M_at_age[(base$M_at_age$Year==base$endyr),as.character(base$agebins)]))
for(i.M in 2:length(M)) {
  if(is.na(M[i.M])){
    M[i.M]=M[i.M-1]
  }
}

if(unique(base$M_at_age$Bio_Pattern)==1){
  M_1<-M
  M_2<-M
}

cv_M_1<-0.2
cv_M_2<-0.2

#!!!where to find M
M_ave = 0.0943

#Step 5 natural mortality
natM<-cbind(age_1, M_1,cv_M_1,M_2,cv_M_2)
colnames(natM) <- c("age","M_Area1", "CV_M_Area1", "M_Area2", "CV_M_Area2")

#Fraction before spawning, currently 0.5
season_factor<-base$seasfracs

#Step 6 recruitment
# if historical 20 year recruitments.
#Rhist_1<-base$natage[(base$natage$Area==1)&(base$natage$Yr<=base$endyr)&(base$natage$Yr>(base$endyr-20))&(base$natage$`Beg/Mid`=="B"),"0"]
#Rhist_2<-base$natage[(base$natage$Area==2)&(base$natage$Yr<=base$endyr)&(base$natage$Yr>(base$endyr-20))&(base$natage$`Beg/Mid`=="B"),"0"]

#Rhist_1_mean<-mean(Rhist_1)
#Rhist_1_sd<-sd(Rhist_1)
#Rhist_1_median<-median(Rhist_1)
#Rhist_1_q1<-quantile(Rhist_1,0.25)
#Rhist_1_q3<-quantile(Rhist_1,0.75)

#Rhist_2_mean<-mean(Rhist_2)
#Rhist_2_sd<-sd(Rhist_2)
#Rhist_2_median<-median(Rhist_2)
#Rhist_2_q1<-quantile(Rhist_2,0.25)
#Rhist_2_q3<-quantile(Rhist_2,0.75)

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

stock_rec_1_mean<-c(t(base$natage[(base$natage$Area==1)&(base$natage$Yr==(base$endyr))&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]))
stock_rec_2_mean<-c(t(base$natage[(base$natage$Area==2)&(base$natage$Yr==(base$endyr))&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]))
spawning_output_rec_1<-stock_rec_1_mean*fec_at_age_1
spawning_output_rec_2<-stock_rec_2_mean*fec_at_age_2

#R calcuation not consistent with the stock assessment report
#R_year1_1_est<-4*steepness*R0_1*sum(spawning_output_rec_1)/((1-steepness)*SSB0_1+(5*steepness-1)*sum(spawning_output_rec_1))
#R_year1_2_est<-4*steepness*R0_2*sum(spawning_output_rec_2)/((1-steepness)*SSB0_2+(5*steepness-1)*sum(spawning_output_rec_2))

#not that consistent with N0. ~1% higher. even first recruitment.
#Assuming R, then M and F, and then growth?

#Step 7 get biological reference point
# We had better to include the biological reference points when we input the official file. Now it is mannually input. 
#SSB_MSY_BRP # of eggs, F_MSY_BRP per year
SSB_MSY_BRP<-1.23e+15
F_MSY_BRP<-0.0588
MSST<-0.5*SSB_MSY_BRP
MFMT<-F_MSY_BRP

#read F
#Fishing fleets definitions (14) Directed fleet landings and discards (8) Bycatch fleets (discards only) (6)
#Commercial Vertical line (HL) E/W 1872-2016
#Commercial Longline (LL) E/W 1980-2016
#Recreational Private/Charter (MRFSS/MRIP) E/W 1950-2016
#Recreational Headboat (HBT) E/W 1950-2016
#Commercial Closed Season or zero IFQ allocation (C_Closed) E/W 1991-2016
#Recreational Closed Season (R_Closed) E/W 1997-2016
#Shrimp Bycatch (SHR) E/W 1950/1946 (respectively)-2015

#F in the last three years, add up together not right
hl_e_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_1']))
hl_w_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_2']))
ll_e_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_3']))
ll_w_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_4']))
mrip_e_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_5']))
mrip_w_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_6']))
hbt_e_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_7']))
hbt_w_pred_F  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_8']))
comm_closed_e_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_9']))
comm_closed_w_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_10']))
rec_closed_e_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_11']))
rec_closed_w_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_12']))
shrimp_e_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'F:_13']))
shrimp_w_pred_F <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'F:_14']))

#total_catch_N <-  (hl_e_pred_F[3] + hl_w_pred_F[3] + ll_e_pred_F[3] + ll_w_pred_F[3]
#                   + mrip_e_pred_F[3] + mrip_w_pred_F[3] + hbt_e_pred_F[3] + hbt_w_pred_F[3]
#                   + comm_closed_e_pred_F[3] + comm_closed_w_pred_F[3] + rec_closed_e_pred_F[3] + rec_closed_w_pred_F[3]
#                   + shrimp_e_pred_F[3] + shrimp_w_pred_F[3])

hl_e_pred_F_ave <- mean(hl_e_pred_F)
hl_w_pred_F_ave <- mean(hl_w_pred_F)
ll_e_pred_F_ave <- mean(ll_e_pred_F) 
ll_w_pred_F_ave <- mean(ll_w_pred_F)
mrip_e_pred_F_ave <- mean(mrip_e_pred_F)
mrip_w_pred_F_ave <- mean(mrip_w_pred_F)
hbt_e_pred_F_ave <- mean(hbt_e_pred_F)
hbt_w_pred_F_ave <- mean(hbt_w_pred_F)
comm_closed_e_pred_F_ave <- mean(comm_closed_e_pred_F)
comm_closed_w_pred_F_ave <- mean(comm_closed_w_pred_F)
rec_closed_e_pred_F_ave <- mean(rec_closed_e_pred_F)
rec_closed_w_pred_F_ave <- mean(rec_closed_w_pred_F)
shrimp_e_pred_F_ave <- mean(shrimp_e_pred_F)
shrimp_w_pred_F_ave <- mean(shrimp_w_pred_F)

#Last year selectivity
hl_e_selex <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
hl_w_selex   <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
ll_e_selex  <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
ll_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
mrip_e_selex   <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
mrip_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
hbt_e_selex   <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
hbt_w_selex   <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
comm_closed_e_selex  <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
comm_closed_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
rec_closed_e_selex  <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
rec_closed_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
shrimp_e_selex  <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
shrimp_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==base$endyr) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))

comp_comm_sel_e <- hl_e_pred_F_ave * hl_e_selex + ll_e_pred_F_ave * ll_e_selex  
comp_comm_sel_w <- hl_w_pred_F_ave * hl_w_selex + ll_w_pred_F_ave * ll_w_selex

comp_recr_sel_e <- mrip_e_pred_F_ave * mrip_e_selex + hbt_e_pred_F_ave* hbt_e_selex
comp_recr_sel_w <- mrip_w_pred_F_ave * mrip_w_selex + hbt_w_pred_F_ave* hbt_w_selex
                
#Catch number in the last three years unit 1000s
hl_e_pred_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'retain(N):_1']))
hl_w_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'retain(N):_2']))
ll_e_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'retain(N):_3']))
ll_w_pred_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'retain(N):_4']))
mrip_e_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'retain(N):_5']))
mrip_w_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'retain(N):_6']))
hbt_e_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'retain(N):_7']))
hbt_w_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'retain(N):_8']))
comm_closed_e_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_9']))
comm_closed_w_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_10']))
rec_closed_e_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_11']))
rec_closed_w_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_12']))
shrimp_e_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_13']))
shrimp_w_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(base$endyr-2)) & (base$timeseries$Yr<=base$endyr) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_14']))

total_catch_N <-  (hl_e_pred_cat_N[3] + hl_w_pred_cat_N[3] + ll_e_pred_cat_N[3] + ll_w_pred_cat_N[3]
                   + mrip_e_pred_cat_N[3] + mrip_w_pred_cat_N[3] + hbt_e_pred_cat_N[3] + hbt_w_pred_cat_N[3]
                    + comm_closed_e_cat_N[3] + comm_closed_w_cat_N[3] + rec_closed_e_cat_N[3] + rec_closed_w_cat_N[3]
                   + shrimp_e_cat_N[3] + shrimp_w_cat_N[3])

sum_SSB_N <- (sum(stock_1_mean)+sum(stock_2_mean))
  
Function_F<-function(F0){
  abs(total_catch_N/sum_SSB_N-(1-exp(-F0-M_ave))*F0/(F0+M_ave))
}

rootSearch<-optim(0,Function_F,method="Nelder-Mead",hessian=TRUE)$par

#location of current status
Cur_SSB_ratio<-(sum(spawning_output_1)+sum(spawning_output_2))/MSST
Cur_F_ratio<-rootSearch/MFMT

#target F (0.75 as a default)
F_plan<-0.75*MFMT

imple_error<-0.2

#ratio between commercial and recreational fisheries
Ratio_comm<-0.51 # in the future, can input from the dialog box
Ratio_rec<-1-Ratio_comm

Function_comm_relF<-function(F0){
  abs(Quote_comm-sum(true_N_1*(1-exp(-F0*comp_comm_sel_e - M_1_true))*F0*comp_comm_sel_e/(F0*comp_comm_sel_e + M_1_true)*weight_at_age_1
                     +true_N_2*(1-exp(-F0*comp_comm_sel_w - M_2_true))*F0*comp_comm_sel_w/(F0*comp_comm_sel_w + M_2_true)*weight_at_age_2))
}

Function_recr_relF<-function(F0){
  abs(Quote_rec-sum(true_N_1*(1-exp(-F0*comp_recr_sel_e - M_1_true))*F0*comp_recr_sel_e/(F0*comp_recr_sel_e + M_1_true)*weight_at_age_1
                    +true_N_2*(1-exp(-F0*comp_recr_sel_w - M_2_true))*F0*comp_recr_sel_w/(F0*comp_recr_sel_w + M_2_true)*weight_at_age_2))
}




####Below is to project, assume the name of the parameters are the same. Run 100 times
Simrun_Num<-100
IniN_Ess_Num<-100
Runtime_short<-3
Runtime_long<-20
count_1<-rep(0,length(stock_1_mean))
count_2<-rep(0,length(stock_2_mean))
seed_file<-'seed.csv'
seed_input<-c(19443,6721,5708,5689,32629,31019,23158,16193,23310,15501,32526,12670,24452,11230,4159,24771,10353,20260,9604,14315,8529,8122,24416,28608,4314,13904,27984,19739,28300,6707,12286,2636,13960,5583,19383,28603,12197,13426,16159,24528,22465,19794,21027,23057,27221,16338,28976,14730,13644,17665,18594,12914,12310,31331,13440,21259,2296,2549,22630,3018,7334,4971,29634,696,3091,15036,17987,13848,25736,32736,6287,12874,3572,17368,15669,24303,29571,7920,7650,10062,6769,27713,10455,503,6945,11897,12954,7077,12393,12767,8172,10601,20784,3985,27644,9733,2108,30224,24282,32406)
true_R_1<-rep(0,Runtime_long)
true_R_2<-rep(0,Runtime_long)
SSB_1<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
SSB_2<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
Catch_comm<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
Catch_recr<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
F_general<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
Catch_general<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
Year_to_green<-rep(Runtime_long,Simrun_Num)

#distribution of N distribution
stock_1_dis_temp<-stock_1_mean/sum(stock_1_mean)
stock_1_dis<-stock_1_dis_temp
for(i.dist in 2:length(stock_1_mean)){
  stock_1_dis[i.dist]<-stock_1_dis[i.dist-1]+stock_1_dis_temp[i.dist]
}

stock_2_dis_temp<-stock_2_mean/sum(stock_2_mean)
stock_2_dis<-stock_2_dis_temp
for(i.dist in 2:length(stock_2_mean)){
  stock_2_dis[i.dist]<-stock_2_dis[i.dist-1]+stock_2_dis_temp[i.dist]
}

for (i.run in 1:Simrun_Num){
  set.seed(as.numeric(seed_input[i.run]))
  green_flag<-0
  #initial N Distribution
  temp1<-runif(IniN_Ess_Num)
  temp2<-runif(IniN_Ess_Num)
  for (i.ess in 1:IniN_Ess_Num){
    j<-which.min(temp1[i.ess]>stock_1_dis)
    count_1[j]<-count_1[j]+1
  }
  true_N_1_dis<-count_1/sum(count_1)
  
  for (i.ess in 1:IniN_Ess_Num){
    j<-which.min(temp2[i.ess]>stock_2_dis)
    count_2[j]<-count_2[j]+1
  }
  true_N_2_dis<-count_2/sum(count_2)
  
  #initial N unit 1000s
  true_N_1_total<-rlnorm(1,log(sum(stock_1_mean)),cv_N_1)
  while ((true_N_1_total>sum(stock_1_mean)*2)|(true_N_1_total<sum(stock_1_mean)/2)){
    true_N_1_total<-rlnorm(1,log(sum(stock_1_mean)),cv_N_1)
  }
  
  true_N_2_total<-rlnorm(1,log(sum(stock_2_mean)),cv_N_2)
  while ((true_N_2_total>sum(stock_2_mean)*2)|(true_N_2_total<sum(stock_2_mean)/2)){
    true_N_2_total<-rlnorm(1,log(sum(stock_2_mean)),cv_N_2)
  }
  
  true_N_1<-true_N_1_total*true_N_1_dis
  true_N_2<-true_N_2_total*true_N_2_dis
  
  for (i.runtime in 1:Runtime_long){
    ##estimate recruitment
    #estimate SSB
    true_SSB_1<-true_N_1 * fec_at_age_1
    true_SSB_2<-true_N_2 * fec_at_age_2
    
    SSB_1[i.run,i.runtime]<-sum(true_SSB_1)
    SSB_2[i.run,i.runtime]<-sum(true_SSB_2)
    
    if (((sum(SSB_1)+sum(SSB_2))/SSB_MSY_BRP>2) & (green_flag==0)){
      green_flag<-1
      Year_to_green[i.run]<-i.runtime
    }
    
    tempR1_mean<-4*steepness*R0_1*sum(true_SSB_1)/((1-steepness)*SSB0_1+(5*steepness-1)*sum(true_SSB_1))
    tempR1<-rlnorm(1,log(tempR1_mean),sigma_R)
    while ((tempR1>tempR1_mean*2)|(tempR1<tempR1_mean/2)){
      tempR1<-rlnorm(1,log(tempR1_mean),sigma_R)
    }
    true_R_1[i.runtime]<-tempR1

    tempR2_mean<-4*steepness*R0_2*sum(true_SSB_2)/((1-steepness)*SSB0_2+(5*steepness-1)*sum(true_SSB_2))
    tempR2<-rlnorm(1,log(tempR2_mean),sigma_R)

    while ((tempR2>tempR2_mean*2)|(tempR2<tempR2_mean/2)){
      tempR2<-rlnorm(1,log(tempR2_mean),sigma_R)
    }
    true_R_2[i.runtime]<-tempR2
    
    true_N_1[1]<-true_R_1[i.runtime]
    true_N_2[1]<-true_R_2[i.runtime]
    
    B_at_age_1<-true_N_1*weight_at_age_1 #biomass unit 1000*kg=mt
    B_at_age_2<-true_N_2*weight_at_age_2 #biomass unit 1000*kg=mt
    
    #Catch quote unit mt
    Quote_total<-(sum(B_at_age_1)+sum(B_at_age_2))*F_plan/(F_plan+M_ave)*(1-exp(-F_plan-M_ave))
    true_quote<-rlnorm(1,log(Quote_total),imple_error)
    while ((true_quote>Quote_total*2)|(true_quote<Quote_total/2)){
      true_quote<-rlnorm(1,log(Quote_total),imple_error)
    }
    
    Catch_general[i.run,i.runtime]<-true_quote
   
    Quote_comm<-true_quote*Ratio_comm
    Quote_rec<-true_quote*Ratio_rec
    Catch_comm[i.run,i.runtime]<-Quote_comm
    Catch_recr[i.run,i.runtime]<-Quote_rec
    
    
    M_1_relative<-rlnorm(1,1,cv_M_1)
    while ((M_1_relative>2)|(M_1_relative<1/2)){
      M_1_relative<-rlnorm(1,1,cv_M_1)
    }
    
    M_2_relative<-rlnorm(1,1,cv_M_2)
    while ((M_2_relative>2)|(M_2_relative<1/2)){
      M_2_relative<-rlnorm(1,1,cv_M_2)
    }
    M_1_true<-M_1_relative*M_1
    M_2_true<-M_2_relative*M_2
    
    recr_relF<-optimize(Function_recr_relF,c(0,1))$minimum
      #optim(0,Function_recr_relF,method="Nelder-Mead",hessian=TRUE)$par
    
    comm_relF<-optimize(Function_comm_relF,c(0,1))$minimum
      #optim(0,Function_comm_relF,method="Nelder-Mead",hessian=TRUE)$par
 
    mod_F_1<-recr_relF * comp_recr_sel_e + comm_relF * comp_comm_sel_e + 
            recr_relF * rec_closed_e_pred_F_ave * rec_closed_e_selex + 
            comm_relF * comm_closed_e_pred_F_ave* comm_closed_e_selex +
            shrimp_e_pred_F_ave * shrimp_e_selex 
    
    mod_F_2<-recr_relF * comp_recr_sel_w + comm_relF * comp_comm_sel_w + 
          recr_relF * rec_closed_w_pred_F_ave * rec_closed_w_selex + 
          comm_relF * comm_closed_w_pred_F_ave* comm_closed_w_selex +
          shrimp_w_pred_F_ave * shrimp_w_selex 
      
    true_N_1_nextyeartemp<-true_N_1*exp(-mod_F_1 -M_1_true)
    true_N_2_nextyeartemp<-true_N_2*exp(-mod_F_2 -M_2_true)
    
    catch_N_1<-(true_N_1-true_N_1_nextyeartemp)*mod_F_1/(mod_F_1 + M_1_true)
    catch_N_2<-(true_N_2-true_N_2_nextyeartemp)*mod_F_2/(mod_F_2 + M_2_true)
    total_catch_N<-sum(catch_N_1)+sum(catch_N_2)
    sum_SSB_N<-sum(true_N_1)+sum(true_N_2)
    
    true_N_1[2:(length(true_N_1)-1)]<-true_N_1_nextyeartemp[1:(length(true_N_1)-2)]
    true_N_2[2:(length(true_N_2)-1)]<-true_N_2_nextyeartemp[1:(length(true_N_2)-2)]
    true_N_1[length(true_N_1)]<-true_N_1_nextyeartemp[length(true_N_1)-1]+true_N_1_nextyeartemp[length(true_N_1)]
    true_N_2[length(true_N_2)]<-true_N_2_nextyeartemp[length(true_N_2)-1]+true_N_2_nextyeartemp[length(true_N_2)]

    F_general[i.run,i.runtime]<-optimize(Function_F,c(0,1))$minimum
    #optim(0,Function_F,method="Nelder-Mead",hessian=TRUE)$par
    
  }

}

#save the following matrix to the 

SSB_1_mean<-colMeans(SSB_1)
SSB_1_sd<-apply(SSB_1, 2,sd)
SSB_1_median<-apply(SSB_1, 2,median)
SSB_1_975<-apply(SSB_1, 2, quantile, probs=0.975)
SSB_1_025<-apply(SSB_1, 2, quantile, probs=0.025)

SSB_2_mean<-colMeans(SSB_2)
SSB_2_sd<-apply(SSB_2, 2,sd)
SSB_2_median<-apply(SSB_2, 2,median)
SSB_2_975<-apply(SSB_2, 2, quantile, probs=0.975)
SSB_2_025<-apply(SSB_2, 2, quantile, probs=0.025)

SSB_total<-SSB_1+SSB_2
SSB_total_mean<-colMeans(SSB_total)
SSB_total_sd<-apply(SSB_total, 2,sd)
SSB_total_median<-apply(SSB_total, 2,median)
SSB_total_975<-apply(SSB_total, 2, quantile, probs=0.975)
SSB_total_025<-apply(SSB_total, 2, quantile, probs=0.025)

Catch_comm_mean<-colMeans(Catch_comm)
Catch_comm_sd<-apply(Catch_comm, 2,sd)
Catch_comm_median<-apply(Catch_comm, 2,median)
Catch_comm_975<-apply(Catch_comm, 2, quantile, probs=0.975)
Catch_comm_025<-apply(Catch_comm, 2, quantile, probs=0.025)

Catch_recr_mean<-colMeans(Catch_recr)
Catch_recr_sd<-apply(Catch_recr, 2,sd)
Catch_recr_median<-apply(Catch_recr, 2,median)
Catch_recr_975<-apply(Catch_recr, 2, quantile, probs=0.975)
Catch_recr_025<-apply(Catch_recr, 2, quantile, probs=0.025)

F_general_mean<-colMeans(F_general)
F_general_sd<-apply(F_general, 2,sd)
F_general_median<-apply(F_general, 2,median)
F_general_975<-apply(F_general, 2, quantile, probs=0.975)
F_general_025<-apply(F_general, 2, quantile, probs=0.025)

Catch_general_mean<-colMeans(Catch_general)
Catch_general_sd<-apply(Catch_general, 2,sd)
Catch_general_median<-apply(Catch_general, 2,median)
Catch_general_975<-apply(Catch_general, 2, quantile, probs=0.975)
Catch_general_025<-apply(Catch_general, 2, quantile, probs=0.025)

Year_to_green_mean<-mean(Year_to_green)
Year_to_green_sd<-sd(Year_to_green)
Year_to_green_median<-median(Year_to_green)
Year_to_green_975<-quantile(Year_to_green,0.975)
Year_to_green_025<-quantile(Year_to_green,0.025)

total_catch_MSEcomp<-sum(Catch_general_median)
catch_var_MSEcomp<-sd(Catch_general_median)
terminal_SSB_MSEcomp<-SSB_total_median[Runtime_long]
lowest_SSB_MSEcomp<-min(SSB_total_median)
  
  resultlist<-cbind(c(2016:2035),Catch_comm_median,Catch_comm_975,Catch_comm_025,Catch_recr_median,Catch_recr_975,Catch_recr_025,SSB_total_median,SSB_total_975,SSB_total_025,F_general_median,F_general_975,F_general_025)
  colnames(resultlist) <- c("year","Catch_comm_median", "Catch_comm_975", "Catch_comm_025", "Catch_recr_median", "Catch_recr_975", "Catch_recr_025", "SSB_total_median", "SSB_total_975","SSB_total_025","F_general_median","F_general_975","F_general_025")
  library("RJSONIO")
  library("plyr")
  resultJson<-toJSON(unname(alply(resultlist,1,identity)))

  mongo <- mongo.create(host = "127.0.0.1", username = "",password = "", db = "admin")
  print(mongo.oid.from.string(process_gen_id))
  resultListJson <- paste('{"process_gen_id":"',process_gen_id,'","resultlist":',resultJson,',"Year_to_green_mean":',Year_to_green_mean
                          ,',"total_catch_MSEcomp":',total_catch_MSEcomp,',"catch_var_MSEcomp":',catch_var_MSEcomp
                          ,',"terminal_SSB_MSEcomp":',terminal_SSB_MSEcomp,',"lowest_SSB_MSEcomp":',lowest_SSB_MSEcomp,'}',sep = "")
  result_list<-mongo.bson.from.JSON(resultListJson)
  mongo.remove(mongo,"admin.mse_result_list",list(process_gen_id=process_gen_id))
  mongo.insert(mongo,"admin.mse_result_list",result_list)
  
  return(resultJson)
  
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

    mse_result <- getMSEInfo("5bd1c626360e2e635192f198")
    #rnd_file_list<-mongo.bson.value(mse_result, "rnd_seed_file")
    #getRondomFile(mongo.oid.to.string(rnd_file_list[1]$`0`),"~/")
    mse_iniPopu = mongo.bson.value(mse_result, "iniPopu")

    age_1<-rep(0,length(mse_iniPopu))
    age_2<-rep(0,length(mse_iniPopu))
    stock_1_mean<-rep(0,length(mse_iniPopu))
    stock_2_mean<-rep(0,length(mse_iniPopu))
    
    for(i.db in 1:length(mse_iniPopu)){
      age_1[i.db]<-i.db-1
      stock_1_mean[i.db]<-mse_iniPopu[[i.db]]$stock_1_mean
      age_2[i.db]<-i.db-1
      stock_2_mean[i.db]<-mse_iniPopu[[i.db]]$stock_2_mean
    }
    #see all the values inside
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

