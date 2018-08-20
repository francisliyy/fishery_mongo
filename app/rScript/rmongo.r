#install rmongo package
#####################################################
#install.packages("devtools")
#library(devtools)
#install_github("mongosoup/rmongodb")
#devtools::install_github("r4ss/r4ss",force=TRUE) #, ref="v1.23.1")
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
storeGlobalSetting<-function(){
  library("rmongodb")
  mongo <- mongo.create()
  start_projection <- as.Date('2017/01/01')
  jsondata <- paste('{"stock1_model_type":"1","time_step":"Y","start_projection":"',start_projection,'","short_term_mgt":15,"short_term_unit":"Y","long_term_mgt":60,"long_term_unit":"Y","stock_per_mgt_unit":2,"mixing_pattern":"0","last_age":20,"no_of_interations":100,"rnd_seed_setting":"0"}',sep = "")
  global_content<-mongo.bson.from.JSON(jsondata)
  mongo.insert(mongo,"admin.global_settings",global_content)
  mongo.count(mongo,"admin.global_settings")
  
}

readr4ss<-function(store_path){
  setwd(store_path)
  require(r4ss)
  direct_ofl <- 'OFL'
  # Extract report Files from directories
  dat_ofl <- SS_output(dir = direct_ofl, covar=T, cormax=0.70, forecast=F, verbose = F)
  getderived <- dat_ofl$derived_quants
  
  ssb_year <- derived[grep('SSB', derived$Label), ]$Value
  f_year <- derived[grep('F', derived$Label), ]$Value
  
  plot_years <- 2019:2048 # years of forecast to plot
  plot_ssb <- ssb_year[175:204]
  plot_F <- f_year[175:204]
  print(plot_F)
}

# This function is used for read random file
# param file_id is the ObjectId get from mse record
# param store_path is the directory where you want to store the file
#' @param file_id The gridfs file id
#' @param store_path file saved directory
#' @serializer unboxedJSON
#' @post /defaultFile
function (file_id,store_path){
  library("rmongodb")
  mongo <- mongo.create()
  gridfs <- mongo.gridfs.create(mongo, "admin")
  gf <- mongo.gridfs.find(gridfs, query=list('_id' = mongo.oid.from.string(file_id)))
  
  if( !is.null(gf)){
    #print(mongo.gridfile.get.length(gf))
    filename <- mongo.gridfile.get.filename(gf)
    #print(filename)
    #store file 
    setwd(store_path)
    downfile <- file(filename)
    mongo.gridfile.pipe(gf, downfile)
    mongo.gridfile.destroy(gf)
    unzip(filename)
  }
  mongo.gridfs.destroy(gridfs)
  
  readr4ss(store_path)
}

if(FALSE){
    ####################################################################
    ##  The following codes illustrate how to get value from mongodb  ##
    ##  based on getMSEInfo function.                                 ##
    ####################################################################
    #invoke Rmongo to get data from mongodb,"5b02cc1b360e2e8f7f93d438", try to get this id from mongo client
    mse_info <- getMSEInfo("5b02cc1b360e2e8f7f93d438")
    #see all the values inside
    print(mse_info)
    #get a specific value
    print(mongo.bson.value(mse_info, "bio_biomass_points"))
    #get a list
    iniPopuList <-mongo.bson.value(mse_info, "iniPopu")
    #get a value in the list
    print(iniPopuList$`0`$age_1)
    #iterate the list to get all value
    for(i in iniPopuList){print(i)}
    #get rnd_seed_file then you can use R to read the file as you want
    rnd_file<-mongo.bson.value(mse_info, "rnd_seed_file")$'0'
    print(as.character(rnd_file))
    rondomFile<-getGridfsFile(as.character(rnd_file),"/Users/yli120/Documents/") 
}

