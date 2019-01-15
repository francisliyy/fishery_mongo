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

# This function connect to the database and get global settings from Mongodb
getGlobal<-function(){
  
  library("rmongodb")
  #mongo.create(host = "127.0.0.1", name = "", username = "",password = "", db = "admin", timeout = 0L)
  result<-mongo.bson.empty()
  mongo <- mongo.create()
  if (mongo.is.connected(mongo)) {
    # read record,use mongo shell to find the value of process_id, replace it in mongo.oid.from.string("5b02cc1b360e2e8f7f93d438"),then execute
    result <- mongo.find.one(mongo, "admin.global_settings")
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
  gf <- mongo.gridfs.find(gridfs, query=list('_id' = mongo.oid.from.string(file_id)))
  filename<-""
  if( !is.null(gf)){
    print(mongo.gridfile.get.length(gf))
    filename <- mongo.gridfile.get.filename(gf)
    print(filename)
    #store file 
    setwd(store_path)
    downfile <- file(filename)
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
  ##start year and end year
  yr_start<-base$startyr
  #endyear was used in Step 2
  yr_end<-base$endyr
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
  simple_spawning<-base$seasfracs
  ########################################################
  #Step 5 ends                                     #######
  ########################################################
  
  ########################################################
  #Step 6 Recruitment                              #######
  ########################################################
  
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
  R0_late<-exp(base$parameters[base$parameters$Label=="SR_LN(R0)","Value"]) #unit 1000 R0 after 1984
  R_offset_para<-base$parameters[base$parameters$Label=="SR_envlink","Value"]
  R0_early<-R0_late*exp(R_offset_para)
  
  SSB0_1<-base$Dynamic_Bzero[(base$Dynamic_Bzero$Era=="VIRG"),"SSB_area1"]
  SSB0_2<-base$Dynamic_Bzero[(base$Dynamic_Bzero$Era=="VIRG"),"SSB_area2"]
  SSB0<-SSB0_1+SSB0_2
  
  sigma_R<-base$parameters[base$parameters$Label=="SR_sigmaR","Value"] #standard deviation of logged recruitment
  
  #unit 1000s
  spawning_output_rec_1<-c(t(base$natage[(base$natage$Area==1)&(base$natage$Yr==(yr_end))&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]))*fec_at_age_1
  spawning_output_rec_2<-c(t(base$natage[(base$natage$Area==2)&(base$natage$Yr==(yr_end))&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]))*fec_at_age_2
  spawning_output_rec<-spawning_output_rec_1+spawning_output_rec_2
  
  Rhist_1<-base$natage[(base$natage$Area==1)&(base$natage$Yr<=yr_end)&(base$natage$Yr>=yr_start)&(base$natage$`Beg/Mid`=="B"),"0"]
  Rhist_2<-base$natage[(base$natage$Area==2)&(base$natage$Yr<=yr_end)&(base$natage$Yr>=yr_start)&(base$natage$`Beg/Mid`=="B"),"0"]
  
  Rhist_late<-Rhist_1 + Rhist_2
  Rhist_early<-Rhist_late[(length(Rhist_late)-(yr_end-1984)):length(Rhist_late)]
  
  Rhist_late_mean<-exp(mean(log(Rhist_late)))
  Rhist_late_25<-qlnorm(0.25,mean(log(Rhist_late)),sd(log(Rhist_late)))
  Rhist_late_50<-qlnorm(0.5,mean(log(Rhist_late)),sd(log(Rhist_late)))
  Rhist_late_75<-qlnorm(0.75,mean(log(Rhist_late)),sd(log(Rhist_late)))  
  
  Rhist_early_mean<-exp(mean(log(Rhist_early)))
  Rhist_early_25<-qlnorm(0.25,mean(log(Rhist_early)),sd(log(Rhist_early)))
  Rhist_early_50<-qlnorm(0.5,mean(log(Rhist_early)),sd(log(Rhist_early)))
  Rhist_early_75<-qlnorm(0.75,mean(log(Rhist_early)),sd(log(Rhist_early)))  
  
  ########################################################
  #Step 6 End                                      #######
  ########################################################
  
  ########################################################
  #extra variable start                            #######
  ########################################################
  
  spawning_output_1<-stock_1_mean*fec_at_age_1*1000
  spawning_output_2<-stock_2_mean*fec_at_age_2*1000
  #sum(spawning_output_1) #matches the SA report 4.1 Spawning Output 
  #sum(spawning_output_2) #matches the SA report 4.1 Spawning Output 
  
  spawning_output_1_json = toJSON(spawning_output_1)
  spawning_output_2_json = toJSON(spawning_output_2)
  
  #Age length key
  length_age_key<-base$ALK[,,1]
  length_age_key_row_name<-rownames(length_age_key)
  length_age_key_stock1<-length_age_key
  length_age_key_stock2<-length_age_key
  
  length_age_key_json = toJSON(length_age_key)
  length_age_key_row_name_json = toJSON(length_age_key_row_name)
  #length_age_key_stock1_json = toJSON(length_age_key_stock1)
  #length_age_key_stock2_json = toJSON(length_age_key_stock2)
  
  
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
  
  #extraF<-cbind(hl_e_pred_F, hl_w_pred_F,ll_e_pred_F,ll_w_pred_F,mrip_e_pred_F,mrip_w_pred_F,hbt_e_pred_F,hbt_w_pred_F,comm_closed_e_pred_F,comm_closed_w_pred_F,rec_closed_e_pred_F,rec_closed_w_pred_F,shrimp_e_pred_F,shrimp_w_pred_F)
  #colnames(extraF) <- c("hl_e_pred_F","hl_w_pred_F", "ll_e_pred_F", "ll_w_pred_F","mrip_e_pred_F","mrip_w_pred_F", "hbt_e_pred_F", "hbt_w_pred_F","comm_closed_e_pred_F","comm_closed_w_pred_F", "rec_closed_e_pred_F", "rec_closed_w_pred_F","shrimp_e_pred_F","shrimp_w_pred_F")
  #extraFJson<-toJSON(unname(alply(extraF,1,identity)))
  
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
  
  hl_e_pred_F_ave_json = toJSON(hl_e_pred_F_ave)
  hl_w_pred_F_ave_json = toJSON(hl_w_pred_F_ave)
  ll_e_pred_F_ave_json = toJSON(ll_e_pred_F_ave)
  ll_w_pred_F_ave_json = toJSON(ll_w_pred_F_ave)
  mrip_e_pred_F_ave_json = toJSON(mrip_e_pred_F_ave)
  mrip_w_pred_F_ave_json = toJSON(mrip_w_pred_F_ave)
  hbt_e_pred_F_ave_json = toJSON(hbt_e_pred_F_ave)
  hbt_w_pred_F_ave_json = toJSON(hbt_w_pred_F_ave)
  comm_closed_e_pred_F_ave_json = toJSON(comm_closed_e_pred_F_ave)
  comm_closed_w_pred_F_ave_json = toJSON(comm_closed_w_pred_F_ave)
  rec_closed_e_pred_F_ave_json = toJSON(rec_closed_e_pred_F_ave)
  rec_closed_w_pred_F_ave_json = toJSON(rec_closed_w_pred_F_ave)
  shrimp_e_pred_F_ave_json = toJSON(shrimp_e_pred_F_ave)
  shrimp_w_pred_F_ave_json = toJSON(shrimp_w_pred_F_ave)
  
  #Last year selectivity
  hl_e_selex <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,1), as.character(base$agebins)]))
  hl_w_selex   <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,2), as.character(base$agebins)]))
  ll_e_selex  <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,3), as.character(base$agebins)]))
  ll_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,4), as.character(base$agebins)]))
  mrip_e_selex   <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,5), as.character(base$agebins)]))
  mrip_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,6), as.character(base$agebins)]))
  hbt_e_selex   <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,7), as.character(base$agebins)]))
  hbt_w_selex   <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,8), as.character(base$agebins)]))
  comm_closed_e_selex  <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,9), as.character(base$agebins)]))
  comm_closed_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,10), as.character(base$agebins)]))
  rec_closed_e_selex  <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,11), as.character(base$agebins)]))
  rec_closed_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,12), as.character(base$agebins)]))
  shrimp_e_selex  <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,13), as.character(base$agebins)]))
  shrimp_w_selex  <- c(t(base$ageselex[(base$ageselex$Yr==yr_end) & is.element(base$ageselex$Factor,"Asel") & is.element(base$ageselex$Fleet,14), as.character(base$agebins)]))
  
  hl_e_selex_json = toJSON(hl_e_selex)
  hl_w_selex_json = toJSON(hl_w_selex)
  ll_e_selex_json = toJSON(ll_e_selex)
  ll_w_selex_json = toJSON(ll_w_selex)
  mrip_e_selex_json = toJSON(mrip_e_selex)
  mrip_w_selex_json = toJSON(mrip_w_selex)
  hbt_e_selex_json = toJSON(hbt_e_selex)
  hbt_w_selex_json = toJSON(hbt_w_selex)
  comm_closed_e_selex_json = toJSON(comm_closed_e_selex)
  comm_closed_w_selex_json = toJSON(comm_closed_w_selex)
  rec_closed_e_selex_json = toJSON(rec_closed_e_selex)
  rec_closed_w_selex_json = toJSON(rec_closed_w_selex)
  shrimp_e_selex_json = toJSON(shrimp_e_selex)
  shrimp_w_selex_json = toJSON(shrimp_w_selex)
  
  #Last year retention rate
  hl_e_retention_len<-base$sizeselex[(base$sizeselex$Yr==yr_end) & is.element(base$sizeselex$Factor,"Ret") & is.element(base$sizeselex$Fleet,1), 6:dim(base$sizeselex)[2]]
  hl_e_retention<-c(as.matrix(hl_e_retention_len)%*%length_age_key_stock1[nrow(length_age_key_stock1):1,])
  hl_w_retention_len<-base$sizeselex[(base$sizeselex$Yr==yr_end) & is.element(base$sizeselex$Factor,"Ret") & is.element(base$sizeselex$Fleet,2), 6:dim(base$sizeselex)[2]]
  hl_w_retention<-c(as.matrix(hl_w_retention_len)%*%length_age_key_stock2[nrow(length_age_key_stock2):1,])
  
  ll_e_retention_len<-base$sizeselex[(base$sizeselex$Yr==yr_end) & is.element(base$sizeselex$Factor,"Ret") & is.element(base$sizeselex$Fleet,3), 6:dim(base$sizeselex)[2]]
  ll_e_retention<-c(as.matrix(ll_e_retention_len)%*%length_age_key_stock1[nrow(length_age_key_stock1):1,])
  ll_w_retention_len<-base$sizeselex[(base$sizeselex$Yr==yr_end) & is.element(base$sizeselex$Factor,"Ret") & is.element(base$sizeselex$Fleet,4), 6:dim(base$sizeselex)[2]]
  ll_w_retention<-c(as.matrix(ll_w_retention_len)%*%length_age_key_stock2[nrow(length_age_key_stock2):1,])
  
  mrip_e_retention_len<-base$sizeselex[(base$sizeselex$Yr==yr_end) & is.element(base$sizeselex$Factor,"Ret") & is.element(base$sizeselex$Fleet,5), 6:dim(base$sizeselex)[2]]
  mrip_e_retention<-c(as.matrix(mrip_e_retention_len)%*%length_age_key_stock1[nrow(length_age_key_stock1):1,])
  mrip_w_retention_len<-base$sizeselex[(base$sizeselex$Yr==yr_end) & is.element(base$sizeselex$Factor,"Ret") & is.element(base$sizeselex$Fleet,6), 6:dim(base$sizeselex)[2]]
  mrip_w_retention<-c(as.matrix(mrip_w_retention_len)%*%length_age_key_stock2[nrow(length_age_key_stock2):1,])
  
  hbt_e_retention_len<-base$sizeselex[(base$sizeselex$Yr==yr_end) & is.element(base$sizeselex$Factor,"Ret") & is.element(base$sizeselex$Fleet,7), 6:dim(base$sizeselex)[2]]
  hbt_e_retention<-c(as.matrix(hbt_e_retention_len)%*%length_age_key_stock1[nrow(length_age_key_stock1):1,])
  hbt_w_retention_len<-base$sizeselex[(base$sizeselex$Yr==yr_end) & is.element(base$sizeselex$Factor,"Ret") & is.element(base$sizeselex$Fleet,8), 6:dim(base$sizeselex)[2]]
  hbt_w_retention<-c(as.matrix(hbt_w_retention_len)%*%length_age_key_stock2[nrow(length_age_key_stock2):1,])
  
  hl_e_retention_json = toJSON(hl_e_retention)
  hl_w_retention_json = toJSON(hl_w_retention)
  ll_e_retention_json = toJSON(ll_e_retention)
  ll_w_retention_json = toJSON(ll_w_retention)
  mrip_e_retention_json = toJSON(mrip_e_retention)
  mrip_w_retention_json = toJSON(mrip_w_retention)
  hbt_e_retention_json = toJSON(hbt_e_retention)
  hbt_w_retention_json = toJSON(hbt_w_retention)
  
  #fisheries status
  #Catch number in the last three years unit 1000s
  #hl_e_pred_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'retain(N):_1']))
  #hl_w_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'retain(N):_2']))
  #ll_e_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'retain(N):_3']))
  #ll_w_pred_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'retain(N):_4']))
  #mrip_e_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'retain(N):_5']))
  #mrip_w_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'retain(N):_6']))
  #hbt_e_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'retain(N):_7']))
  #hbt_w_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'retain(N):_8']))
  hl_e_pred_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_1']))
  hl_w_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_2']))
  ll_e_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_3']))
  ll_w_pred_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_4']))
  mrip_e_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_5']))
  mrip_w_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_6']))
  hbt_e_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_7']))
  hbt_w_pred_cat_N  <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_8']))
  comm_closed_e_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_9']))
  comm_closed_w_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_10']))
  rec_closed_e_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_11']))
  rec_closed_w_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_12']))
  shrimp_e_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,1) & is.element(base$timeseries$Era,'TIME'),'dead(N):_13']))
  shrimp_w_cat_N <- c(t(base$timeseries[(base$timeseries$Yr>=(yr_end-2)) & (base$timeseries$Yr<=yr_end) & is.element(base$timeseries$Area,2) & is.element(base$timeseries$Era,'TIME'),'dead(N):_14']))
  
  stock_1_N<-base$natage[(base$natage$Area==1)&(base$natage$Yr>=(yr_end-2))&(base$natage$Yr<=yr_end)&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]
  stock_2_N<-base$natage[(base$natage$Area==2)&(base$natage$Yr>=(yr_end-2))&(base$natage$Yr<=yr_end)&(base$natage$`Beg/Mid`=="B"),as.character(base$agebins)]
  
  total_catch_N <-  (hl_e_pred_cat_N + hl_w_pred_cat_N + ll_e_pred_cat_N + ll_w_pred_cat_N
                     + mrip_e_pred_cat_N + mrip_w_pred_cat_N + hbt_e_pred_cat_N + hbt_w_pred_cat_N
                     + comm_closed_e_cat_N + comm_closed_w_cat_N + rec_closed_e_cat_N + rec_closed_w_cat_N
                     + shrimp_e_cat_N + shrimp_w_cat_N)
  total_catch_N_json = toJSON(total_catch_N)
  
  sum_SSB_N <- c(t(rowSums(stock_1_N)+rowSums(stock_2_N)))
  sum_SSB_N_json = toJSON(sum_SSB_N)
  
  Current_F<-mean(total_catch_N/sum_SSB_N)
  Current_SSB<-sum(spawning_output_1+spawning_output_2)
  Current_F_json = toJSON(Current_F)
  Current_SSB_json = toJSON(Current_SSB)

  MSST<-0.5*as.numeric(ssb_msy)
  MFMT<-as.numeric(f_msy)
  MSST_json = toJSON(MSST)
  MFMT_json = toJSON(MFMT)
  
  #Position of the year 2016 in the traffic light
  Current_F_ratio<-Current_F/MFMT
  Current_SSB_ratio<-Current_SSB/MSST
  Current_F_ratio_json = toJSON(Current_F_ratio)
  Current_SSB_ratio_json = toJSON(Current_SSB_ratio)
  
  extraParamJson<-paste('{"spawning_output_1":',spawning_output_1_json,',"spawning_output_2":',spawning_output_2_json
                        ,',"length_age_key":',length_age_key_json,',"length_age_key_row_name":',length_age_key_row_name_json
                        ,',"hl_e_pred_F_ave":',hl_e_pred_F_ave_json,',"hl_w_pred_F_ave":',hl_w_pred_F_ave_json,',"ll_e_pred_F_ave":',ll_e_pred_F_ave_json,',"ll_w_pred_F_ave":',ll_w_pred_F_ave_json
                        ,',"mrip_e_pred_F_ave":',hl_e_pred_F_ave_json,',"mrip_w_pred_F_ave":',mrip_w_pred_F_ave_json,',"hbt_e_pred_F_ave":',hbt_e_pred_F_ave_json,',"hbt_w_pred_F_ave":',hbt_w_pred_F_ave_json
                        ,',"comm_closed_e_pred_F_ave":',comm_closed_e_pred_F_ave_json,',"comm_closed_w_pred_F_ave":',comm_closed_w_pred_F_ave_json
                        ,',"rec_closed_e_pred_F_ave":',rec_closed_e_pred_F_ave_json,',"rec_closed_w_pred_F_ave":',rec_closed_w_pred_F_ave_json
                        ,',"shrimp_e_pred_F_ave":',shrimp_e_pred_F_ave_json,',"shrimp_w_pred_F_ave":',shrimp_w_pred_F_ave_json
                        ,',"hl_e_selex":',hl_e_selex_json,',"hl_w_selex":',hl_w_selex_json,',"ll_e_selex":',ll_e_selex_json,',"ll_w_selex":',ll_w_selex_json
                        ,',"mrip_e_selex":',mrip_e_selex_json,',"mrip_w_selex":',mrip_w_selex_json,',"hbt_e_selex":',hbt_e_selex_json,',"hbt_w_selex":',hbt_w_selex_json
                        ,',"comm_closed_e_selex":',comm_closed_e_selex_json,',"comm_closed_w_selex":',comm_closed_w_selex_json
                        ,',"rec_closed_e_selex":',rec_closed_e_selex_json,',"rec_closed_w_selex":',rec_closed_w_selex_json,',"shrimp_e_selex":',shrimp_e_selex_json,',"shrimp_w_selex":',shrimp_w_selex_json
                        ,',"hl_e_retention":',hl_e_retention_json,',"hl_w_retention":',hl_w_retention_json,',"ll_e_retention":',ll_e_retention_json,',"ll_w_retention":',ll_w_retention_json
                        ,',"mrip_e_retention":',mrip_e_retention_json,',"mrip_w_retention":',mrip_w_retention_json
                        ,',"hbt_e_retention":',hbt_e_retention_json,',"hbt_w_retention":',hbt_w_retention_json,',"hl_e_retention":',hl_e_retention_json,',"hl_e_retention":',hl_e_retention_json
                        ,',"total_catch_N":',total_catch_N_json,',"sum_SSB_N":',sum_SSB_N_json,',"Current_F":',Current_F_json
                        ,',"MSST":',MSST_json,',"MFMT":',MFMT_json,',"Current_F_ratio":',Current_F_ratio_json,',"Current_SSB_ratio":',Current_SSB_ratio_json
                        ,'}',sep = "")
  
  
  ########################################################
  #extra variable end                              #######
  ########################################################

  library("rmongodb")
  mongo <- mongo.create(host = "127.0.0.1", username = "",password = "", db = "admin")
  start_projection <- as.Date('2016/01/01')
  jsondata <- paste('{"stock1_model_type":"1","stock1_input_file_type":"1","time_step":"Y","start_projection":"',start_projection,'","short_term_mgt":3,"short_term_unit":"Y","long_term_mgt":20,"long_term_unit":"Y","stock_per_mgt_unit":2,"mixing_pattern":"0","last_age":20,"no_of_interations":100,"sample_size":1000,"rnd_seed_setting":"1","iniPopu":',iniPopuJson
                    ,',"ip_cv_1":',ip_cv_1,',"ip_cv_2":',ip_cv_2,',"bioParam":',bioParamJson,',"nm_cv_1":',nm_cv_1,',"nm_cv_2":',nm_cv_2,',"nm_m":"c","mortality":',mortalityParamJson,',"simple_spawning":',simple_spawning
                    ,',"cvForRecu":',sigma_R,',"stock1_amount":23,"stock2_amount":77,"recruitTypeStock1":"2","formulaStock1":"1","fromFmlStock1":"2","fml1MbhmSSB0":',SSB0,',"fml1MbhmR0":',R0_late,',"fml1MbhmR0_early":',R0_early,',"fml1MbhmSteep":',steepness
                    ,',"hst1_lower":',Rhist_late_25,',"hst1_median":',Rhist_late_50,',"hst1_mean":',Rhist_late_mean,',"hst1_upper":',Rhist_late_75,',"hst1_lower_early":',Rhist_early_25,',"hst1_median_early":',Rhist_early_50,',"hst1_mean_early":',Rhist_early_mean,',"hst1_upper_early":',Rhist_early_75
                    ,',"ssb_msy":',ssb_msy,',"f_msy":',f_msy,',"hrt_harvest_rule":"CF","mg1_cv":0.2'
                    ,',"sec_recreational":51,"sec_commercial":49,"sec_hire":45.1,"sec_private":54.9,"sec_headboat":50,"sec_charterboat":50,"sec_pstar":42.7,"sec_act_com":0,"sec_act_pri":20,"sec_act_hire":20'
                    ,',"mg3_commercial":13,"mg3_recreational":16,"mg3_forhire":10,"mg3_private":10,"mg3_rec_east_open":11.8,"mg3_rec_east_closed":11.8,"mg3_rec_west_open":11.8,"mg3_rec_west_closed":11.8'
                    ,',"mg3_comhard_east_open":56,"mg3_comhard_east_closed":55,"mg3_comhard_west_open":60,"mg3_comhard_west_closed":74,"mg3_comlong_east_open":64,"mg3_comlong_east_closed":55,"mg3_comlong_west_open":81,"mg3_comlong_west_closed":74'
                    ,',"mg4_season":"1","mg4_act_catch_hire":"220000","mg4_act_catch_private":"220000","mg4_input_hire":"220000","mg4_hire_length":"3","mg4_input_private":"220000","mg4_private_length":"3"'
                    ,',"extraParam":',extraParamJson,'}',sep = "")
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
# This function is used for Run MSE and get result.
#' @serializer unboxedJSON
#' @post /runmse
function(process_gen_id){
  
  ##########################################################  
  ###### Get Database User Interface Value Start ###########
  ########################################################## 
  
  mse_result <- getMSEInfo(process_gen_id)
  #mse_result <- getMSEInfo('5c361ea5360e2ed89687b607')
  
  #Options, in the webpage, these value should be read from the database
  
  ### never used variables, ignore begin ####
  time_step_switch<-2 # 1: half year, 2: 1 year.  12312018 currently only year.
  mixing_pattern_switch<-1 # 1: no mixing, 2: constant, 3: same over year, 4: time varies 12312018 currently only no mixing
  HCR_pattern<-2 #HCR pattern 1: constant C, 2: constant F
  ### never used variables, ignore end ####
  
  ####   no use, just keep it, start #######
  seed_switch<-1 #1: default, 2: self-defind
  if(seed_switch==1){
    #use default path
  }else if(seed_switch==2){
    #use self uploaded path
  }
  
  agebins<-20 #currently can not change
  age_1<-agebins
  age_2<-age_1
  
  ####   no use, just keep it, end #######
  
  ### general input ###
  project_start_year<-as.numeric(substring(as.Date(mongo.bson.value(mse_result, "start_projection")),0,4))
  Runtime_short<-mongo.bson.value(mse_result, "short_term_mgt") # unit year
  Runtime_long<-mongo.bson.value(mse_result, "long_term_mgt") # unit year
  Simrun_Num<-mongo.bson.value(mse_result, "no_of_interations")
  IniN_Ess_Num<-mongo.bson.value(mse_result, "sample_size")
  rnd_file_list<-mongo.bson.value(mse_result, "rnd_seed_file")
  rnd_file_name<-getRondomFile(mongo.oid.to.string(rnd_file_list[1]$`0`),"~/")
  seed_input<-read.csv(rnd_file_name,header = F)
  
  ### initial population ###
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

  cv_N_1<-mongo.bson.value(mse_result, "ip_cv_1")
  cv_N_2<-mongo.bson.value(mse_result, "ip_cv_2")
  
  ### biological parameters ###
  
  mse_bioParam = mongo.bson.value(mse_result, "bioParam")
  
  weight_at_age_1<-rep(0,length(mse_bioParam))
  fec_at_age_1<-rep(0,length(mse_bioParam))
  weight_at_age_2<-rep(0,length(mse_bioParam))
  fec_at_age_2<-rep(0,length(mse_bioParam))
  
  for(i.db in 1:length(mse_bioParam)){
    weight_at_age_1[i.db]<-mse_bioParam[[i.db]]$weight_at_age_1
    fec_at_age_1[i.db]<-mse_bioParam[[i.db]]$fec_at_age_1
    weight_at_age_2[i.db]<-mse_bioParam[[i.db]]$weight_at_age_2
    fec_at_age_2[i.db]<-mse_bioParam[[i.db]]$fec_at_age_2
  }
  
  ### natural mortality ###
  
  mse_mortality = mongo.bson.value(mse_result, "mortality")
  
  M_1<-rep(0,length(mse_mortality))
  M_2<-rep(0,length(mse_mortality))
  
  for(i.db in 1:length(mse_mortality)){
    M_1[i.db]<-mse_mortality[[i.db]]$mean_1
    M_2[i.db]<-mse_mortality[[i.db]]$mean_2
  }
  
  M_switch<-mongo.bson.value(mse_result, "nm_m") #h: high M, l: low M, and c: default current M
  if(M_switch=='h'){
    M_1<-M_1*1.5
    M_2<-M_2*1.5
  }else if(M_switch=='l'){
    M_1<-M_1*0.5
    M_2<-M_2*0.5
  }else if(M_switch=='c'){
    M_1<-M_1
    M_2<-M_2
  }
  
  cv_M_1<-mongo.bson.value(mse_result, "nm_cv_1")
  cv_M_2<-mongo.bson.value(mse_result, "nm_cv_2")
  
  season_factor<-mongo.bson.value(mse_result, "simple_spawning") #unit year
  
  ### recruitment ###
  sigma_R<-mongo.bson.value(mse_result, "cvForRecu")
  stock_1_rec_ratio<-mongo.bson.value(mse_result, "stock1_amount")/100.00
  
  #the following are interactions, can be done with javascript
  #set switch for recruitment: switch_R_pattern 1: history  2: estimate from equation 
  #set switch for recruitment: switch_R_year: 1: include years before 1984   2:exclude years before 1984
  switch_R_pattern<-mongo.bson.value(mse_result, "recruitTypeStock1")
  switch_R_year<-mongo.bson.value(mse_result, "fromHisStock1")
  switch_R_formula<-mongo.bson.value(mse_result, "fromFmlStock1")
  switch_R_year_early<-mongo.bson.value(mse_result, "historySt1_early")
  switch_R_year_later<-mongo.bson.value(mse_result, "historySt1")
  
  #  Rhist_late_mean<-exp(mean(log(Rhist_late)))
  #  Rhist_late_25<-qlnorm(0.25,mean(log(Rhist_late)),sd(log(Rhist_late)))
  #  Rhist_late_50<-qlnorm(0.5,mean(log(Rhist_late)),sd(log(Rhist_late)))
  #  Rhist_late_75<-qlnorm(0.75,mean(log(Rhist_late)),sd(log(Rhist_late)))  
  
  #  Rhist_early_mean<-exp(mean(log(Rhist_early)))
  #  Rhist_early_25<-qlnorm(0.25,mean(log(Rhist_early)),sd(log(Rhist_early)))
  #  Rhist_early_50<-qlnorm(0.5,mean(log(Rhist_early)),sd(log(Rhist_early)))
  #  Rhist_early_75<-qlnorm(0.75,mean(log(Rhist_early)),sd(log(Rhist_early)))  
  
  if(switch_R_pattern==1){
   if(switch_R_year==1){		    	
      if(switch_R_year_early==1){
        Rhist<-mongo.bson.value(mse_result, "hst1_lower_early")
      }else if(switch_R_year_early==2){		    	
        Rhist<-mongo.bson.value(mse_result, "hst1_median_early")
      }else if(switch_R_year_early==3){		    	
        Rhist<-mongo.bson.value(mse_result, "hst1_mean_early")
      }else if(switch_R_year_early==4){		    	
        Rhist<-mongo.bson.value(mse_result, "hst1_upper_early")
      }
    }else{
      if(switch_R_year_later==1){		    	
        Rhist<-mongo.bson.value(mse_result, "hst1_lower")
      }else if(switch_R_year_later==2){		    	
        Rhist<-mongo.bson.value(mse_result, "hst1_median")
      }else if(switch_R_year_later==3){		    	
        Rhist<-mongo.bson.value(mse_result, "hst1_mean")
      }else if(switch_R_year_later==4){		    	
        Rhist<-mongo.bson.value(mse_result, "hst1_upper")
      }
    }
    rec_pattern1_quantile<-0.5
  }else if(switch_R_pattern==2){
    if(switch_R_formula==1){
      R0<-mongo.bson.value(mse_result, "fml1MbhmR0_early")
    }else if (switch_R_formula==2){
      R0<-mongo.bson.value(mse_result, "fml1MbhmR0")
    }
    steepness<-mongo.bson.value(mse_result, "fml1MbhmSteep")
    SSB0<-mongo.bson.value(mse_result, "fml1MbhmSSB0")
  }
  
  ### management option I ###
  
  SSB_MSY_BRP<-mongo.bson.value(mse_result, "bio_catch_mt")
  F_MSY_BRP<-mongo.bson.value(mse_result, "bio_f_percent")
  
  Harvest_level<-mongo.bson.value(mse_result, "harvest_level")
  
  imple_error<-mongo.bson.value(mse_result, "mg1_cv")
  
  ### management option II ###
  
  # Management option. They are also default values...
  Ratio_comm<-mongo.bson.value(mse_result, "sec_commercial")/100.00 # ratio between commercial and recreational fisheries
  Ratio_rec<-1-Ratio_comm
  
  Forhire_ratio<-mongo.bson.value(mse_result, "sec_hire")/100.00
  Private_ratio<-1-Forhire_ratio
  
  Headboat_ratio<-mongo.bson.value(mse_result, "sec_headboat")/100.00
  Chartboat_ratio<-1-Headboat_ratio
  
  OFL_pvalue<-mongo.bson.value(mse_result, "sec_pstar")/100.00
  
  Comme_buffer_cv<-mongo.bson.value(mse_result, "sec_act_com")/100.00
  
  Private_buffer_cv<-mongo.bson.value(mse_result, "sec_act_pri")/100.00
  
  Forhire_buffer_cv<-mongo.bson.value(mse_result, "sec_act_hire")/100.00
  
  ### management option III ###
  #legal size
  Comme_min_size_in<-mongo.bson.value(mse_result, "mg3_commercial") # unit inch
  Recre_min_size_in<-mongo.bson.value(mse_result, "mg3_recreational")  #unit inch
  
  #bag limit
  Private_bag_limit<- mongo.bson.value(mse_result, "mg3_private") # unit Number per bag
  Forhire_bag_limit<- mongo.bson.value(mse_result, "mg3_forhire") # unit Number per bag
  
  #discard fractions unit %
  Recre_discard_E_open<-mongo.bson.value(mse_result, "mg3_rec_east_open")/100.00
  Recre_discard_E_closed<-mongo.bson.value(mse_result, "mg3_rec_east_closed")/100.00
  Recre_discard_W_open<-mongo.bson.value(mse_result, "mg3_rec_west_open")/100.00
  Recre_discard_W_closed<-mongo.bson.value(mse_result, "mg3_rec_west_closed")/100.00
  
  Comme_ll_discard_E_open<-mongo.bson.value(mse_result, "mg3_comlong_east_open")/100.00
  Comme_ll_discard_W_open<-mongo.bson.value(mse_result, "mg3_comlong_west_open")/100.00
  Comme_ll_discard_E_closed<-mongo.bson.value(mse_result, "mg3_comlong_east_closed")/100.00
  Comme_ll_discard_W_closed<-mongo.bson.value(mse_result, "mg3_comlong_west_closed")/100.00
  
  Comme_hl_discard_E_open<-mongo.bson.value(mse_result, "mg3_comhard_east_open")/100.00
  Comme_hl_discard_W_open<-mongo.bson.value(mse_result, "mg3_comhard_west_open")/100.00
  Comme_hl_discard_E_closed<-mongo.bson.value(mse_result, "mg3_comhard_east_closed")/100.00
  Comme_hl_discard_W_closed<-mongo.bson.value(mse_result, "mg3_comhard_west_closed")/100.00
  
  ### management option IV ### 
  Recre_season_switch<-mongo.bson.value(mse_result, "mg4_season")
  
  if(Recre_season_switch==1) {#determined by ACT
    #Allowable_catch predetermined
    Forhire_catch_rate_lb<-mongo.bson.value(mse_result, "mg4_act_catch_hire") #unit lb per day
    Private_catch_rate_lb<-mongo.bson.value(mse_result, "mg4_act_catch_private") #unit lb per day
    Forhire_season_length<-999999
    Private_season_length<-999999
  }  else if(Recre_season_switch==2) {#input by user
    Forhire_catch_rate_lb<-mongo.bson.value(mse_result, "mg4_input_hire") #unit lb per day
    Private_catch_rate_lb<-mongo.bson.value(mse_result, "mg4_input_private") #unit lb per day
    Forhire_season_length<-mongo.bson.value(mse_result, "mg4_hire_length") #unit days
    Private_season_length<-mongo.bson.value(mse_result, "mg4_private_length") #unit days
  }
    
    
  ### extra parameter from default setting but not shown in the user interface ###  
  
    ##########################################################  
    ###### Get Database User Interface Value End   ###########
    ########################################################## 
    
    ##########################################################  
    ###### Get Database Global setting Value Start ###########
    ##########################################################
    
    global_settings<-getGlobal()
    extra_param<-mongo.bson.value(global_settings, "extraParam") 
    
    spawning_output_1<-unlist(extra_param$spawning_output_1)
    spawning_output_2<-unlist(extra_param$spawning_output_2)
    
    length_age_key<-extra_param$length_age_key
    length_age_key <- matrix(unlist(length_age_key), ncol = 21, byrow = TRUE)
    length_age_key_row_name<-unlist(extra_param$length_age_key_row_name)
    rownames(length_age_key)<-length_age_key_row_name
    colnames(length_age_key)<-0:agebins
    
    hl_e_pred_F_ave<-as.vector(extra_param$hl_e_pred_F_ave)
    hl_w_pred_F_ave<-as.vector(extra_param$hl_w_pred_F_ave)
    ll_e_pred_F_ave<-as.vector(extra_param$ll_e_pred_F_ave)
    ll_w_pred_F_ave<-as.vector(extra_param$ll_w_pred_F_ave)
    mrip_e_pred_F_ave<-as.vector(extra_param$mrip_e_pred_F_ave)
    mrip_w_pred_F_ave<-as.vector(extra_param$mrip_w_pred_F_ave)
    hbt_e_pred_F_ave<-as.vector(extra_param$hbt_e_pred_F_ave)
    hbt_w_pred_F_ave<-as.vector(extra_param$hbt_w_pred_F_ave)
    comm_closed_e_pred_F_ave<-as.vector(extra_param$comm_closed_e_pred_F_ave)
    comm_closed_w_pred_F_ave<-as.vector(extra_param$comm_closed_w_pred_F_ave)
    rec_closed_e_pred_F_ave<-as.vector(extra_param$rec_closed_e_pred_F_ave)
    rec_closed_w_pred_F_ave<-as.vector(extra_param$rec_closed_w_pred_F_ave)
    shrimp_e_pred_F_ave<-as.vector(extra_param$shrimp_e_pred_F_ave)
    shrimp_w_pred_F_ave<-as.vector(extra_param$shrimp_w_pred_F_ave)
    
    hl_e_selex<-unlist(extra_param$hl_e_selex)
    hl_w_selex<-unlist(extra_param$hl_w_selex)
    ll_e_selex<-unlist(extra_param$ll_e_selex)
    ll_w_selex<-unlist(extra_param$ll_w_selex)
    mrip_e_selex<-unlist(extra_param$mrip_e_selex)
    mrip_w_selex<-unlist(extra_param$mrip_w_selex)
    hbt_e_selex<-unlist(extra_param$hbt_e_selex)
    hbt_w_selex<-unlist(extra_param$hbt_w_selex)
    comm_closed_e_selex<-unlist(extra_param$comm_closed_e_selex)
    comm_closed_w_selex<-unlist(extra_param$comm_closed_w_selex)
    rec_closed_e_selex<-unlist(extra_param$rec_closed_e_selex)
    rec_closed_w_selex<-unlist(extra_param$rec_closed_w_selex)
    shrimp_e_selex<-unlist(extra_param$shrimp_e_selex)
    shrimp_w_selex<-unlist(extra_param$shrimp_w_selex)
    
    hl_e_retention<-unlist(extra_param$hl_e_retention)
    hl_w_retention<-unlist(extra_param$hl_w_retention)
    ll_e_retention<-unlist(extra_param$ll_e_retention)
    ll_w_retention<-unlist(extra_param$ll_w_retention)
    mrip_e_retention<-unlist(extra_param$mrip_e_retention)
    mrip_w_retention<-unlist(extra_param$mrip_w_retention)
    hbt_e_retention<-unlist(extra_param$hbt_e_retention)
    hbt_w_retention<-unlist(extra_param$hbt_w_retention)
    hl_e_retention<-unlist(extra_param$hl_e_retention)
    
    total_catch_N<-unlist(extra_param$total_catch_N)
    sum_SSB_N<-unlist(extra_param$sum_SSB_N)
    Current_F<-unlist(extra_param$Current_F)
    Current_SSB<-unlist(extra_param$Current_SSB)
    MSST<-extra_param$MSST
    MFMT<-extra_param$MFMT
    Current_F_ratio<-extra_param$Current_F_ratio
    Current_SSB_ratio<-extra_param$Current_SSB_ratio
    
    
    ##########################################################  
    ###### Get Database Global setting Value End ###########
    ########################################################## 
  
  
  
  
  
  
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
  
  #estimate M
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
  
  #some calculation before the ACL simulation
  #legal size selectivity 
  Comme_min_size_cm<-Comme_min_size_in*2.54 # unit inch
  Recre_min_size_cm<-Recre_min_size_in*2.54  #unit inch
  thre_bin_comme<-which.max(as.numeric(rownames(length_age_key))<=Comme_min_size_cm)
  thre_bin_recre<-which.max(as.numeric(rownames(length_age_key))<=Recre_min_size_cm)
  Comme_legal_selx<-colSums(length_age_key[as.numeric(rownames(length_age_key))>Comme_min_size_cm,])+length_age_key[thre_bin_comme,]*(1-(Comme_min_size_cm-as.numeric(rownames(length_age_key)[thre_bin_comme]))/2)
  Recre_legal_selx<-colSums(length_age_key[as.numeric(rownames(length_age_key))>Recre_min_size_cm,])+length_age_key[thre_bin_recre,]*(1-(Recre_min_size_cm-as.numeric(rownames(length_age_key)[thre_bin_recre]))/2)
  
  #estimate direct fishing F
  comp_comm_sel_e <- hl_e_pred_F_ave * hl_e_selex * hl_e_retention + ll_e_pred_F_ave * ll_e_selex * ll_e_retention 
  comp_comm_sel_w <- hl_w_pred_F_ave * hl_w_selex * hl_w_retention + ll_w_pred_F_ave * ll_w_selex * ll_w_retention
  
  comp_recr_sel_e <- mrip_e_pred_F_ave * mrip_e_selex * mrip_e_retention + hbt_e_pred_F_ave* hbt_e_selex * hbt_e_retention
  comp_recr_sel_w <- mrip_w_pred_F_ave * mrip_w_selex * mrip_w_retention + hbt_w_pred_F_ave* hbt_w_selex * hbt_w_retention
  
  #estimate open season discards death for a directed fleet
  comp_comm_discard_e <- hl_e_pred_F_ave * hl_e_selex * (1-hl_e_retention) * Comme_hl_discard_E_open + ll_e_pred_F_ave * ll_e_selex * (1-ll_e_retention) * Comme_ll_discard_E_open
  comp_comm_discard_w <- hl_w_pred_F_ave * hl_w_selex * (1-hl_w_retention) * Comme_hl_discard_W_open + ll_w_pred_F_ave * ll_w_selex * (1-ll_w_retention) * Comme_ll_discard_W_open
  
  comp_recr_discard_e <- mrip_e_pred_F_ave * mrip_e_selex * (1-mrip_e_retention) * Recre_discard_E_open + hbt_e_pred_F_ave* hbt_e_selex * (1-hbt_e_retention) * Recre_discard_E_open
  comp_recr_discard_w <- mrip_w_pred_F_ave * mrip_w_selex * (1-mrip_w_retention) * Recre_discard_W_open+ hbt_w_pred_F_ave* hbt_w_selex * (1-hbt_w_retention) * Recre_discard_W_open
  
  #estimate F functions
  Function_comm_relF<-function(F0){
    abs(Quote_comm-sum(true_N_1*(1-exp(-F0*comp_comm_sel_e - M_1_true))*F0*comp_comm_sel_e/(F0*comp_comm_sel_e + M_1_true)*weight_at_age_1
                       +true_N_2*(1-exp(-F0*comp_comm_sel_w - M_2_true))*F0*comp_comm_sel_w/(F0*comp_comm_sel_w + M_2_true)*weight_at_age_2))
  }
  
  Function_recr_relF<-function(F0){
    abs(Quote_rec-sum(true_N_1*(1-exp(-F0*comp_recr_sel_e - M_1_true))*F0*comp_recr_sel_e/(F0*comp_recr_sel_e + M_1_true)*weight_at_age_1
                      +true_N_2*(1-exp(-F0*comp_recr_sel_w - M_2_true))*F0*comp_recr_sel_w/(F0*comp_recr_sel_w + M_2_true)*weight_at_age_2))
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  ####Below is to project for a short term to determin ABC/ACL: assume the name of the parameters are the same. Run 100 times
  count_1<-rep(0,length(stock_1_mean))
  count_2<-rep(0,length(stock_2_mean))
  Catch_pred<-matrix(rep(0,Simrun_Num*Runtime_short), ncol=Runtime_short)
  
  for (i.run in 1:Simrun_Num){
    
    set.seed(as.numeric(seed_input[i.run]))
    
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
    
    for (i.runtime in 1:Runtime_short){
      ##estimate recruitment
      #estimate SSB
      true_SSB_1<-true_N_1 * fec_at_age_1
      true_SSB_2<-true_N_2 * fec_at_age_2
      
      if(switch_R_pattern==1){
        tempR_mean<-as.numeric(quantile(Rhist,rec_pattern1_quantile))
      }else if (switch_R_pattern==2){
        tempR_mean<-4*steepness*R0*sum(true_SSB_1+true_SSB_2)/((1-steepness)*SSB0+(5*steepness-1)*sum(true_SSB_1+true_SSB_2))
      }
      
      tempR<-rlnorm(1,log(tempR_mean),sigma_R)
      while ((tempR>tempR_mean*2)|(tempR<tempR_mean/2)){
        tempR<-rlnorm(1,log(tempR_mean),sigma_R)
      }
      true_R_1<-tempR*stock_1_rec_ratio
      true_R_2<-tempR*(1-stock_1_rec_ratio)
      
      true_N_1[1]<-true_R_1
      true_N_2[1]<-true_R_2
      
      B_at_age_1<-true_N_1*weight_at_age_1 #biomass unit 1000*kg=mt
      B_at_age_2<-true_N_2*weight_at_age_2 #biomass unit 1000*kg=mt
      
      #Catch quote unit mt
      Quote_total<-(sum(B_at_age_1)+sum(B_at_age_2))*Harvest_level
      true_quote<-rlnorm(1,log(Quote_total),imple_error)
      while ((true_quote>Quote_total*2)|(true_quote<Quote_total/2)){
        true_quote<-rlnorm(1,log(Quote_total),imple_error)
      }
      
      Quote_comm<-true_quote*Ratio_comm
      Quote_rec<-true_quote*Ratio_rec
      
      recr_relF<-optimize(Function_recr_relF,c(0,1))$minimum
      #optim(0,Function_recr_relF,method="Nelder-Mead",hessian=TRUE)$par
      
      comm_relF<-optimize(Function_comm_relF,c(0,1))$minimum
      #optim(0,Function_comm_relF,method="Nelder-Mead",hessian=TRUE)$par
      
      total_F_1<-recr_relF * comp_recr_sel_e + comm_relF * comp_comm_sel_e + 
        recr_relF * comp_recr_discard_e + comm_relF * comp_comm_discard_e + 
        recr_relF * rec_closed_e_pred_F_ave * rec_closed_e_selex * Recre_discard_E_closed+ 
        comm_relF * comm_closed_e_pred_F_ave * comm_closed_e_selex * (Comme_ll_discard_E_closed +Comme_hl_discard_E_closed)/2 +
        shrimp_e_pred_F_ave * shrimp_e_selex 
      
      total_F_2<-recr_relF * comp_recr_sel_w + comm_relF * comp_comm_sel_w + 
        recr_relF * comp_recr_discard_w + comm_relF * comp_comm_discard_w + 
        recr_relF * rec_closed_w_pred_F_ave * rec_closed_w_selex * Recre_discard_E_closed + 
        comm_relF * comm_closed_w_pred_F_ave * comm_closed_w_selex * (Comme_ll_discard_W_closed +Comme_hl_discard_W_closed)/2 +
        shrimp_w_pred_F_ave * shrimp_w_selex 
      
      mod_F_1<-recr_relF * comp_recr_sel_e + comm_relF * comp_comm_sel_e
      
      mod_F_2<-recr_relF * comp_recr_sel_w + comm_relF * comp_comm_sel_w
      
      true_N_1_nextyeartemp<-true_N_1*exp(-total_F_1 -M_1_true)
      true_N_2_nextyeartemp<-true_N_2*exp(-total_F_2 -M_2_true)
      
      catch_N_1<-(true_N_1-true_N_1_nextyeartemp)*mod_F_1/(total_F_1 + M_1_true)
      catch_N_2<-(true_N_2-true_N_2_nextyeartemp)*mod_F_2/(total_F_2 + M_2_true)
      total_catch_N<-sum(catch_N_1)+sum(catch_N_2)
      total_catch_B<-sum(catch_N_1 * weight_at_age_1 +catch_N_2 * weight_at_age_2) #unit mt
      Catch_pred[i.run,i.runtime]<-total_catch_B
      
      true_N_1[2:(length(true_N_1)-1)]<-true_N_1_nextyeartemp[1:(length(true_N_1)-2)]
      true_N_2[2:(length(true_N_2)-1)]<-true_N_2_nextyeartemp[1:(length(true_N_2)-2)]
      true_N_1[length(true_N_1)]<-true_N_1_nextyeartemp[length(true_N_1)-1]+true_N_1_nextyeartemp[length(true_N_1)]
      true_N_2[length(true_N_2)]<-true_N_2_nextyeartemp[length(true_N_2)-1]+true_N_2_nextyeartemp[length(true_N_2)]
      
    }
    
  }
  
  ACL_planned<-as.numeric(quantile(rowMeans(Catch_pred),0.427))
  
  
  #true accountability measures
  green_flag<-0
  count_1_imple<-rep(0,length(stock_1_mean))
  count_2_imple<-rep(0,length(stock_2_mean))
  R_1<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  R_2<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  SSB_1<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  SSB_2<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  AM_comm<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  AM_recr<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  AM_rec_overage_y1<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  AM_rec_overage_y2<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  AM_rec_overage_y3<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  AM_1<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  AM_2<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  Forhire_planned_season_length<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  Private_planned_season_length<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  F_general<-matrix(rep(0,Simrun_Num*Runtime_long), ncol=Runtime_long)
  Year_to_green<-rep(Runtime_long,Simrun_Num)
  
  for (i.run in 1:Simrun_Num){
    
    set.seed(as.numeric(seed_input[i.run]))
    
    #initial N Distribution
    temp1<-runif(IniN_Ess_Num)
    temp2<-runif(IniN_Ess_Num)
    for (i.ess in 1:IniN_Ess_Num){
      j<-which.min(temp1[i.ess]>stock_1_dis)
      count_1_imple[j]<-count_1_imple[j]+1
    }
    true_N_1_dis<-count_1_imple/sum(count_1_imple)
    
    for (i.ess in 1:IniN_Ess_Num){
      j<-which.min(temp2[i.ess]>stock_2_dis)
      count_2_imple[j]<-count_2_imple[j]+1
    }
    true_N_2_dis<-count_2_imple/sum(count_2_imple)
    
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
      
      
      if(switch_R_pattern==1){
        tempR_mean<-as.numeric(quantile(Rhist,rec_pattern1_quantile))
      }else if (switch_R_pattern==2){
        tempR_mean<-4*steepness*R0*sum(true_SSB_1+true_SSB_2)/((1-steepness)*SSB0+(5*steepness-1)*sum(true_SSB_1+true_SSB_2))
      }
      
      tempR<-rlnorm(1,log(tempR_mean),sigma_R)
      while ((tempR>tempR_mean*2)|(tempR<tempR_mean/2)){
        tempR<-rlnorm(1,log(tempR_mean),sigma_R)
      }
      true_R_1<-tempR*stock_1_rec_ratio
      true_R_2<-tempR*(1-stock_1_rec_ratio)
      
      R_1[i.run, i.runtime]<-true_R_1
      R_2[i.run, i.runtime]<-true_R_2
      
      true_N_1[1]<-true_R_1
      true_N_2[1]<-true_R_1
      
      B_at_age_1<-true_N_1*weight_at_age_1 #biomass unit 1000*kg=mt
      B_at_age_2<-true_N_2*weight_at_age_2 #biomass unit 1000*kg=mt
      
      Quote_comm_imple<-ACL_planned * Ratio_comm
      Quote_rec<-ACL_planned * Ratio_rec
      
      if((AM_rec_overage_y1[i.run,i.runtime]+AM_rec_overage_y2[i.run,i.runtime]+AM_rec_overage_y3[i.run,i.runtime])>0){
        Quote_rec_imple<-max(Quote_rec-(AM_rec_overage_y1[i.run,i.runtime]+AM_rec_overage_y2[i.run,i.runtime]+AM_rec_overage_y3[i.run,i.runtime]),0)
      }else{
        Quote_rec_imple<-Quote_rec
      }
      
      Quote_forhire<-Quote_rec_imple * Forhire_ratio
      Quote_private<-Quote_rec_imple * Private_ratio
      
      True_quote_comm<-rlnorm(1,log(Quote_comm_imple),Comme_buffer_cv)
      while((True_quote_comm>Quote_comm_imple*2)|(True_quote_comm<Quote_comm/2)){
        True_quote_comm<-rlnorm(1,log(Quote_comm_imple),Comme_buffer_cv)
      }
      
      True_quote_forhire<-rlnorm(1,log(Quote_forhire),Forhire_buffer_cv)
      while((True_quote_forhire>Quote_forhire*2)|(True_quote_forhire<Quote_forhire/2)){
        True_quote_forhire<-rlnorm(1,log(Quote_forhire),Forhire_buffer_cv)
      }
      
      True_quote_private<-rlnorm(1,log(Quote_private),Private_buffer_cv)
      while((True_quote_private>Quote_private*2)|(True_quote_private<Quote_private/2)){
        True_quote_private<-rlnorm(1,log(Quote_private),Private_buffer_cv)
      }
      
      #update season length
      #ACT and season length
      Forhire_catch_rate_kg<-Forhire_catch_rate_lb/0.453592 #unit kg per day
      Private_catch_rate_kg<-Private_catch_rate_lb/0.453592 #unit kg per day 
      if(Recre_season_switch==1) {#determined by ACT
        #Allowable_catch predetermined
        Forhire_planned_catch<-True_quote_forhire #unit mt
        Private_planned_catch<-True_quote_private #unit mt
        Forhire_planned_season_length[i.run,i.runtime]<-True_quote_forhire*1000/Forhire_catch_rate_kg #unit day
        Private_planned_season_length[i.run,i.runtime]<-True_quote_private*1000/Private_catch_rate_kg #unit day
      }else if(Recre_season_switch==2) {#input by user
        Forhire_planned_season_length[i.run,i.runtime]<-Forhire_season_length
        Private_planned_season_length[i.run,i.runtime]<-Private_season_length
        Forhire_planned_catch<-Forhire_catch_rate_kg*Forhire_season_length/1000 #unit mt
        Private_planned_catch<-Private_catch_rate_kg*Private_season_length/1000 #unit mt
      }
      
      Comme_planned_catch<-True_quote_comm
      Recre_planned_catch<-Forhire_planned_catch+Private_planned_catch
      
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
      
      recr_relF_imple<-rlnorm(1,log(recr_relF),imple_error)
      if((recr_relF_imple>recr_relF*2)|(recr_relF_imple<recr_relF/2)){
        recr_relF_imple<-rlnorm(1,log(recr_relF),imple_error)
      }
      
      comm_relF_imple<-rlnorm(1,log(comm_relF),imple_error)
      if((comm_relF_imple>comm_relF*2)|(comm_relF_imple<comm_relF/2)){
        comm_relF_imple<-rlnorm(1,log(comm_relF),imple_error)
      }
      
      total_F_1_imple<-recr_relF_imple * comp_recr_sel_e + comm_relF_imple * comp_comm_sel_e + 
        recr_relF_imple * comp_recr_discard_e + comm_relF_imple * comp_comm_discard_e + 
        recr_relF_imple * rec_closed_e_pred_F_ave * rec_closed_e_selex * Recre_discard_E_closed+ 
        comm_relF_imple * comm_closed_e_pred_F_ave * comm_closed_e_selex * (Comme_ll_discard_E_closed +Comme_hl_discard_E_closed)/2 +
        shrimp_e_pred_F_ave * shrimp_e_selex 
      
      total_F_2_imple<-recr_relF_imple * comp_recr_sel_w + comm_relF_imple * comp_comm_sel_w + 
        recr_relF_imple * comp_recr_discard_w + comm_relF_imple * comp_comm_discard_w + 
        recr_relF_imple * rec_closed_w_pred_F_ave * rec_closed_w_selex * Recre_discard_E_closed + 
        comm_relF_imple * comm_closed_w_pred_F_ave * comm_closed_w_selex * (Comme_ll_discard_W_closed +Comme_hl_discard_W_closed)/2 +
        shrimp_w_pred_F_ave * shrimp_w_selex 
      
      mod_F_1_imple<-recr_relF_imple * comp_recr_sel_e + comm_relF_imple * comp_comm_sel_e
      mod_F_2_imple<-recr_relF_imple * comp_recr_sel_w + comm_relF_imple * comp_comm_sel_w
      
      true_N_1_nextyeartemp<-true_N_1*exp(-total_F_1_imple -M_1_true)
      true_N_2_nextyeartemp<-true_N_2*exp(-total_F_2_imple -M_2_true)
      
      AM_1[i.run,i.runtime]<-sum((true_N_1-true_N_1_nextyeartemp)*mod_F_1_imple/(total_F_1_imple + M_1_true)*weight_at_age_1)
      AM_2[i.run,i.runtime]<-sum((true_N_2-true_N_2_nextyeartemp)*mod_F_2_imple/(total_F_2_imple + M_2_true)*weight_at_age_2)
      AM_recr[i.run,i.runtime]<-sum((true_N_1-true_N_1_nextyeartemp)*recr_relF_imple * comp_recr_sel_e/(total_F_1_imple + M_1_true)*weight_at_age_1+
                                      (true_N_2-true_N_2_nextyeartemp)*recr_relF_imple * comp_recr_sel_w/(total_F_2_imple + M_2_true)*weight_at_age_2)
      AM_comm[i.run,i.runtime]<-sum((true_N_1-true_N_1_nextyeartemp)*comm_relF_imple * comp_comm_sel_e/(total_F_1_imple + M_1_true)*weight_at_age_1+
                                      (true_N_2-true_N_2_nextyeartemp)*comm_relF_imple * comp_comm_sel_w/(total_F_2_imple + M_2_true)*weight_at_age_2)
      
      if(AM_recr[i.run,i.runtime]>3*Quote_rec_imple){
        AM_rec_overage_y3[i.run,i.runtime+3]<-min(AM_recr[i.run,i.runtime]-3*Quote_rec_imple,Quote_rec_imple)
        AM_rec_overage_y2[i.run,i.runtime+2]<-Quote_rec_imple
        AM_rec_overage_y1[i.run,i.runtime+1]<-Quote_rec_imple
      }else if (AM_recr[i.run,i.runtime]>2*Quote_rec_imple){
        AM_rec_overage_y2[i.run,i.runtime+2]<-AM_recr[i.run,i.runtime]-2*Quote_rec_imple
        AM_rec_overage_y1[i.run,i.runtime+1]<-Quote_rec_imple
      }else if (AM_recr[i.run,i.runtime]>Quote_rec_imple){
        AM_rec_overage_y1[i.run,i.runtime+1]<-AM_recr[i.run,i.runtime]-Quote_rec_imple
      }
      
      #If no assessment error    
      true_N_1[2:(length(true_N_1)-1)]<-true_N_1_nextyeartemp[1:(length(true_N_1)-2)]
      true_N_2[2:(length(true_N_2)-1)]<-true_N_2_nextyeartemp[1:(length(true_N_2)-2)]
      true_N_1[length(true_N_1)]<-true_N_1_nextyeartemp[length(true_N_1)-1]+true_N_1_nextyeartemp[length(true_N_1)]
      true_N_2[length(true_N_2)]<-true_N_2_nextyeartemp[length(true_N_2)-1]+true_N_2_nextyeartemp[length(true_N_2)]
      
      F_general[i.run,i.runtime]<-(AM_1[i.run,i.runtime]+AM_2[i.run,i.runtime])/(SSB_1[i.run,i.runtime]+SSB_2[i.run,i.runtime])
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
  
  SSB_total_ratio_median<-SSB_total_median/MSST
  #SSB_total_ratio_median<-c(Current_SSB_ratio,SSB_total_ratio_median)
  
  F_general_mean<-colMeans(F_general)
  F_general_sd<-apply(F_general, 2,sd)
  F_general_median<-apply(F_general, 2,median)
  F_general_975<-apply(F_general, 2, quantile, probs=0.975)
  F_general_025<-apply(F_general, 2, quantile, probs=0.025)
  
  F_general_ratio_median<-F_general_median/MFMT
  #F_general_ratio_median<-c(Current_F_ratio,F_general_ratio_median)
  
  AM_comm_mean<-colMeans(AM_comm)
  AM_comm_sd<-apply(AM_comm, 2,sd)
  AM_comm_median<-apply(AM_comm, 2,median)
  AM_comm_975<-apply(AM_comm, 2, quantile, probs=0.975)
  AM_comm_025<-apply(AM_comm, 2, quantile, probs=0.025)
  
  AM_recr_mean<-colMeans(AM_recr)
  AM_recr_sd<-apply(AM_recr, 2,sd)
  AM_recr_median<-apply(AM_recr, 2,median)
  AM_recr_975<-apply(AM_recr, 2, quantile, probs=0.975)
  AM_recr_025<-apply(AM_recr, 2, quantile, probs=0.025)
  
  Forhire_planned_season_length_mean<-colMeans(Forhire_planned_season_length)
  Forhire_planned_season_length_sd<-apply(Forhire_planned_season_length, 2,sd)
  Forhire_planned_season_length_median<-apply(Forhire_planned_season_length, 2,median)
  Forhire_planned_season_length_975<-apply(Forhire_planned_season_length, 2, quantile, probs=0.975)
  Forhire_planned_season_length_025<-apply(Forhire_planned_season_length, 2, quantile, probs=0.025)
  
  Private_planned_season_length_mean<-colMeans(Private_planned_season_length)
  Private_planned_season_length_sd<-apply(Private_planned_season_length, 2,sd)
  Private_planned_season_length_median<-apply(Private_planned_season_length, 2,median)
  Private_planned_season_length_975<-apply(Private_planned_season_length, 2, quantile, probs=0.975)
  Private_planned_season_length_025<-apply(Private_planned_season_length, 2, quantile, probs=0.025)
  
  Year_to_green_mean<-mean(Year_to_green)
  Year_to_green_sd<-sd(Year_to_green)
  Year_to_green_median<-median(Year_to_green)
  Year_to_green_975<-quantile(Year_to_green,0.975)
  Year_to_green_025<-quantile(Year_to_green,0.025)
  
  
  total_catch_MSEcomp<-sum(AM_recr_median+AM_comm_median)
  catch_var_MSEcomp<-sd(AM_recr_median+AM_comm_median)
  total_recr_catch_MSEcomp<-sum(AM_recr_median)
  catch_recr_var_MSEcomp<-sd(AM_recr_median)
  total_comm_catch_MSEcomp<-sum(AM_comm_median)
  catch_comm_var_MSEcomp<-sd(AM_comm_median)
  total_forhire_season_MSEcomp<-sum(Forhire_planned_season_length_median)
  forhire_season_var_MSEcomp<-sd(Forhire_planned_season_length_median)
  total_private_season_MSEcomp<-sum(Private_planned_season_length_median)
  private_season_var_MSEcomp<-sd(Private_planned_season_length_median)
  terminal_SSB_MSEcomp<-SSB_total_median[Runtime_long]
  lowest_SSB_MSEcomp<-min(SSB_total_median)
  #also compare Year_to_green
  
  #ratio of recreational fisheries among states, FL, AL, MS, LA, TX
  #Ratio_state_forhire<-c(0.2767,0.3392,0.0898,0.2184,0.076)
  #Ratio_state_private<-c(0.358,0.2489,0.0074,0.1376,0.248)
  
  ### MSE compare
  #Compare total catch and terminal SSB
  #spider figure include, total catch, catch variation, terminal SSB, lowest SSB, and year to green.
  
  ## MSE advanced compare
  # change target F and commercial and recreational ratio. make target SSB grey.
  # call above simulation for multiple times...
  # for every run record total catch, catch variation, terminal SSB, lowest SSB, and year to green.
  
  
  ######### new program end ##############
  year_start<-project_start_year+1
  year_end<-project_start_year+20
  resultlist<-cbind(c(year_start:year_end),AM_comm_median,AM_comm_975,AM_comm_025,AM_recr_median,AM_recr_975,AM_recr_025
                    ,SSB_total_median,SSB_total_975,SSB_total_025,SSB_1_median,SSB_1_975,SSB_1_025,SSB_2_median,SSB_2_975,SSB_2_025
                    ,Forhire_planned_season_length_median,Forhire_planned_season_length_975,Forhire_planned_season_length_025
                    ,Private_planned_season_length_median,Private_planned_season_length_975,Private_planned_season_length_025
                    ,F_general_median,F_general_975,F_general_025
                    ,SSB_total_ratio_median,F_general_ratio_median)
  colnames(resultlist) <- c("year","AM_comm_median", "AM_comm_975", "AM_comm_025", "AM_recr_median", "AM_recr_975", "AM_recr_025"
                    ,"SSB_total_median", "SSB_total_975","SSB_total_025","SSB_1_median", "SSB_1_975","SSB_1_025","SSB_2_median", "SSB_2_975","SSB_2_025"
                    ,"Forhire_planned_season_length_median","Forhire_planned_season_length_975","Forhire_planned_season_length_025"
                    ,"Private_planned_season_length_median","Private_planned_season_length_975","Private_planned_season_length_025"
                    ,"F_general_median","F_general_975","F_general_025"
                    ,"SSB_total_ratio_median","F_general_ratio_median")
  library("RJSONIO")
  library("plyr")
  resultJson<-toJSON(unname(alply(resultlist,1,identity)))

  mongo <- mongo.create(host = "127.0.0.1", username = "",password = "", db = "admin")
  print(mongo.oid.from.string(process_gen_id))
  resultListJson <- paste('{"process_gen_id":"',process_gen_id,'","resultlist":',resultJson
                          ,',"Year_to_green_mean":',Year_to_green_mean
                          ,',"total_catch_MSEcomp":',total_catch_MSEcomp,',"catch_var_MSEcomp":',catch_var_MSEcomp
                          ,',"terminal_SSB_MSEcomp":',terminal_SSB_MSEcomp,',"lowest_SSB_MSEcomp":',lowest_SSB_MSEcomp
                          ,',"total_recr_catch_MSEcomp":',total_recr_catch_MSEcomp,',"catch_recr_var_MSEcomp":',catch_recr_var_MSEcomp
                          ,',"total_comm_catch_MSEcomp":',total_comm_catch_MSEcomp,',"catch_comm_var_MSEcomp":',catch_comm_var_MSEcomp,'}',sep = "")
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

    mse_result <- getMSEInfo("5c2d31ab360e2ea33f0a15f7")
    rnd_file_list<-mongo.bson.value(mse_result, "rnd_seed_file")
    getRondomFile(mongo.oid.to.string(rnd_file_list[1]$`0`),"~/")
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

