import pandas as pd
import numpy as np
import os
from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
# The database URI
#app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///db/belly_button_biodiversity.sqlite"
#db = SQLAlchemy(app)

db = os.path.join('DataSets', 'belly_button_biodiversity.sqlite')
engine = create_engine(f"sqlite:///{db}")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)
# Print all of the classes mapped to the Base
#print(Base.classes.keys())

# Save reference to the table
Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_metadata = Base.classes.samples_metadata
# Create our session (link) from Python to the DB
session = Session(engine)

# Create the inspector and connect it to the engine
inspector = inspect(engine)

@app.route("/")
def index():
    return render_template('index.html')


#List of sample names.
@app.route('/names')
#,  methods=["GET", "POST"])
def names():
    columns = inspector.get_columns('samples')
    nameslist=[]
    itercolumns = iter(columns)
    next(itercolumns)
    for column in itercolumns:
        #print(column["name"])
        nameslist.append(column["name"])
    return jsonify(nameslist)
 
#List of OTU descriptions.
@app.route('/otu')
def otu():
    results = session.query(Otu.lowest_taxonomic_unit_found).all()
    taxonomicUnitList = []
    for result in results:
        taxonomicUnitList.append(result[0])
    return jsonify(taxonomicUnitList)

@app.route('/metadata', defaults={'sample':'BB_940'})
@app.route('/metadata/<sample>')
#MetaData for a given sample.
#Args: Sample in the format: `BB_940`
#Returns a json dictionary of sample metadata in the format
def metadata(sample='BB_940'):
    #sample=request.args.get('sampleid', default = 'BB_940', type = str )
    sampleDefaultID = sample.split("_")
    #http://127.0.0.1:5000/metadata?sampleid=bb_950
    metaData = {}
    results = session.query(Samples_metadata.AGE, Samples_metadata.BBTYPE, Samples_metadata.ETHNICITY,\
    Samples_metadata.GENDER, Samples_metadata.LOCATION, Samples_metadata.SAMPLEID,)
    for result in results:
        if(str(result[5])==sampleDefaultID[1]):
            keys = ["AGE: ","BBTYPE: ","ETHNICITY: ", "GENDER: ", "LOCATION: ","SAMPLEID: "]
            metaData = dict(zip(keys, result))
    # Let's review a slightly different way to query data using SQLAlchemy
    #df = pd.read_sql_query(results, db.session.bind)
    return jsonify(metaData)

@app.route('/wfreq', defaults={'sample':'BB_940'})
@app.route('/wfreq/<sample>')
#Weekly Washing Frequency as a number.
#Args: Sample in the format: `BB_940`
#Returns an integer value for the weekly washing frequency `WFREQ`
def wfreq(sample):
    #sample=request.args.get('sampleid', default = 'BB_940', type = str)
    sampleDefaultID = sample.split("_")
    #http://127.0.0.1:5000/wfreq?sampleid=BB_941
    results = session.query(Samples_metadata.SAMPLEID, Samples_metadata.WFREQ)
    wfreq=[]
    for result in results:
        if(str(result[0])== sampleDefaultID[1]):
            wfreq.append(result[1])
    return jsonify(wfreq)

@app.route('/samples', defaults={'sample':'BB_940'})
@app.route('/samples/<sample>')
#OTU IDs and Sample Values for a given sample.
#Sort your Pandas DataFrame (OTU ID and Sample Value)
#in Descending Order by Sample Value
def samples(sample):
    #sampleDefault=request.args.get('sampleid', default = 'BB_940', type = str)
    #http://127.0.0.1:5000/samples?sampleid=BB_941
    sortedList= []
    sortedDict = {}
    otu_ids = []
    sample_values = []
    results = session.query(Samples.otu_id, getattr(Samples,sample)).order_by(getattr(Samples,sample).desc())
    for result in results:
        if(getattr(result,sample)!=0):
            otu_ids.append(result.otu_id)
            sample_values.append(getattr(result,sample))
    #print(len(otu_id))
    #print(len(sample_values))
    keys = ["otu_ids", "sample_values"]
    values = [otu_ids, sample_values]
    sortedDict = dict(zip(keys, values))
    sortedList = [sortedDict]
    #print(sortedList)
    return jsonify(sortedList)

if __name__ == "__main__":
    app.run(debug=True)
