FROM trestletech/plumber
RUN Rscript -e "install.packages('devtools')"
RUN Rscript -e "devtools::install_github('mongosoup/rmongodb')"
RUN Rscript -e "devtools::install_github('r4ss/r4ss',force=TRUE)"
RUN Rscript -e "install.packages('RJSONIO')"
RUN Rscript -e "install.packages('plyr')"
WORKDIR /app/
COPY rmongo.r /app/
CMD ["/app/rmongo.r"]
