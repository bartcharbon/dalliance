/* -*- mode: javascript; c-basic-offset: 4; indent-tabs-mode: nil -*- */

// 
// Dalliance Genome Explorer
// (c) Thomas Down 2006-2013
//
// Molgenisjson.js -- query the Molgenis REST API.
//

"use strict";

if (typeof(require) !== 'undefined') {
    var sa = require('./sourceadapters');
    var dalliance_registerSourceAdapterFactory = sa.registerSourceAdapterFactory;
    var FeatureSourceBase = sa.FeatureSourceBase;

    var das = require('./das');
    var DASStylesheet = das.DASStylesheet;
    var DASStyle = das.DASStyle;
    var DASFeature = das.DASFeature;
    var DASGroup = das.DASGroup;
}

function MolgenisFeatureSource(source) {
    FeatureSourceBase.call(this);
    this.source = source;
    if (source.uri) {
      this.base = source.uri;
    } else if (source.entity) {
        this.base = window.location.origin + '/api/v2/' + source.entity + '?' + Math.random();
    }else{
        throw new Error("Bad molgenis track configuration: please specify 'genome_attrs.chr' and 'genome_attrs.pos'");
    }

    this.species = source.species || 'human';

    if (typeof source.type === 'string') {
        this.type = [source.type];
    } else {
        this.type = source.type || ['regulatory'];
    }
}

MolgenisFeatureSource.prototype = Object.create(FeatureSourceBase.prototype);
MolgenisFeatureSource.prototype.constructor = MolgenisFeatureSource;

MolgenisFeatureSource.prototype.getStyleSheet = function(callback) {
    var stylesheet = new DASStylesheet();

    {
        var varStyle = new DASStyle();
        varStyle.glyph = 'TEXT';
        varStyle.STRING = 'A';
        varStyle.BUMP = 'yes';
        varStyle.LABEL = 'no';
        varStyle.FGCOLOR = 'green';
        stylesheet.pushStyle({type: 'variant', method: 'A'}, null, varStyle);
    }
    {
        var varStyle = new DASStyle();
        varStyle.glyph = 'TEXT';
        varStyle.STRING = 'C';
        varStyle.BUMP = 'yes';
        varStyle.LABEL = 'no';
        varStyle.FGCOLOR = 'blue';
        stylesheet.pushStyle({type: 'variant', method: 'C'}, null, varStyle);
    }
    {
        var varStyle = new DASStyle();
        varStyle.glyph = 'TEXT';
        varStyle.STRING = 'G';
        varStyle.BUMP = 'yes';
        varStyle.LABEL = 'no';
        varStyle.FGCOLOR = 'orange';
        stylesheet.pushStyle({type: 'variant', method: 'G'}, null, varStyle);
    }
    {
        var varStyle = new DASStyle();
        varStyle.glyph = 'TEXT';
        varStyle.STRING = 'T';
        varStyle.BUMP = 'yes';
        varStyle.LABEL = 'no';
        varStyle.FGCOLOR = 'red';
        stylesheet.pushStyle({type: 'variant', method: 'T'}, null, varStyle);
    }
    {
        var varStyle = new DASStyle();
        varStyle.glyph = 'TEXT';
        varStyle.STRING = '?';
        varStyle.BUMP = 'yes';
        varStyle.LABEL = 'no';
        varStyle.FGCOLOR = 'darkgrey';
        stylesheet.pushStyle({type: 'variant', method: 'unknown'}, null, varStyle);
    }
    {
        var varStyle = new DASStyle();
        varStyle.glyph = 'DOT';
        varStyle.BUMP = 'yes';
        varStyle.LABEL = 'no';
        varStyle.FGCOLOR = 'purple';
        stylesheet.pushStyle({type: 'indel'}, null, varStyle);
    }
    {
        var varStyle = new DASStyle();
        varStyle.glyph = 'STAR';
        varStyle.BUMP = 'yes';
        varStyle.LABEL = 'no';
        varStyle.FGCOLOR = 'black';
        stylesheet.pushStyle({type: 'variant', method: 'multiple'}, null, varStyle);
    }
    {
        var wigStyle = new DASStyle();
        wigStyle.glyph = 'BOX';
        wigStyle.FGCOLOR = 'blue';
        wigStyle.BGCOLOR = 'blue'
        wigStyle.HEIGHT = 8;
        wigStyle.BUMP = true;
        wigStyle.LABEL = false;
        wigStyle.ZINDEX = 20;
        stylesheet.pushStyle({type: 'default'}, null, wigStyle);
    }
    {
        var wigStyle = new DASStyle();
        wigStyle.glyph = 'BOX';
        wigStyle.FGCOLOR = 'red';
        wigStyle.BGCOLOR = 'red'
        wigStyle.HEIGHT = 8;
        wigStyle.LABEL = true;
        wigStyle.ZINDEX = 20;
        stylesheet.pushStyle({type: 'exon', method: 'exon'}, null, wigStyle);
    }
    {
        var wigStyle = new DASStyle();
        wigStyle.glyph = 'BOX';
        wigStyle.FGCOLOR = 'white';
        wigStyle.BGCOLOR = 'white'
        wigStyle.HEIGHT = 8;
        wigStyle.LABEL = true;
        wigStyle.ZINDEX = 20;
        stylesheet.pushStyle({type: 'exon', method: 'intron'}, null, wigStyle);
    }
    {
        var varStyle = new DASStyle();
        varStyle.glyph = 'HISTOGRAM';
        varStyle.BGCOLOR = 'blue';
        varStyle.HEIGHT = 50;
        stylesheet.pushStyle({type: 'numeric'}, null, varStyle);
    }

    return callback(stylesheet);
}


MolgenisFeatureSource.prototype.getScales = function() {
    return [];
}

MolgenisFeatureSource.prototype.fetch = function(chr, min, max, scale, types, pool, callback) {
    var thisB = this;
    var source = this.source;

    if (!source.genome_attrs.chr || !source.genome_attrs.pos) {
        throw new Error("Bad molgenis track configuration: please specify 'genome_attrs.chr' and 'genome_attrs.pos'");
    }

    var url = this.base;


    if (source.attrs) {
        var attributes = [];
        for (var index = 0; index < source.attrs.length; ++index) {
            var attr = source.attrs[index];
            var attrArray = attr.split(":");
            attributes.push(attrArray[0]);
        }
        if(attributes[source.genome_attrs.chr] === undefined) {
            attributes.push(source.genome_attrs.chr);
        }
        if(attributes[source.genome_attrs.pos] === undefined) {
            attributes.push(source.genome_attrs.pos);
        }
        if(attributes[source.genome_attrs.alt] === undefined) {
            if(source.genome_attrs.alt) {
                attributes.push(source.genome_attrs.alt);
            }
        }
        if(attributes[source.genome_attrs.ref] === undefined) {
            if(source.genome_attrs.ref) {
                attributes.push(source.genome_attrs.ref);
            }
        }
        if(attributes[source.genome_attrs.stop] === undefined) {
            if(source.genome_attrs.stop) {
                attributes.push(source.genome_attrs.stop);
            }
        }
        url += '&attrs=' + encodeURIComponent(attributes);
    }

    if (source.genome_attrs.stop) {
        url += '&q=' + encodeURIComponent(source.genome_attrs.chr) + '==' + chr + ';(' + source.genome_attrs.pos + '=ge=' + min + ';' + source.genome_attrs.pos + '=le=' + max + ',' + source.genome_attrs.stop + '=ge=' + min + ';' + source.genome_attrs.stop + '=le=' + max + ')';
    } else {
        url += '&q=' + encodeURIComponent(source.genome_attrs.chr) + '==' + chr + ';' + source.genome_attrs.pos + '=ge=' + min + ';' + source.genome_attrs.pos + '=le=' + max;
    }

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
    	if (req.readyState == 4) {
            thisB.busy--;
            thisB.notifyActivity();

    	    if (req.status >= 300) {
                var err = 'Error code ' + req.status;
                try {
                    var jr = JSON.parse(req.response);
                    if (jr.error) {
                        err = jr.error;
                    }
                } catch (ex) {};

    		    callback(err, null);
    	    } else {
        		var jf = JSON.parse(req.response);
        		var items = jf.items;
        		var features = [];
        		for (var fi = 0; fi < items.length; ++fi) {
                    var entity = items[fi];
                    var notes = [];
                    var feature = new DASFeature();
                    feature.segment = chr;
                    feature.min = entity[source.genome_attrs.pos] | 0;
                    if(source.genome_attrs.stop)
                    {
                        feature.max = entity[source.genome_attrs.stop] | 0;
                    }
                    else{
                        feature.max = entity[source.genome_attrs.pos] | 0;
                    }

                    feature.type = entity.feature_type || 'unknown';
                    var identifier;
                    if (source.label_attr) {
                        identifier = source.label_attr;
                    } else {
                        identifier = "ID";
                    }
                    feature.id = entity[identifier];

                    //add attrs to notes for use in popup
                    if (source.attrs) {
                        for (var index = 0; index < source.attrs.length; ++index) {
                            var attr = source.attrs[index];
                            var attrArray = attr.split(":");

                            var label = attrArray[1];
                            var value = entity[attrArray[0]];

                            notes.push(label + '=' + value);
                        }
                    }
                    if (source.actions) {
                        feature.actions = eval(source.actions);
                        feature.entity = entity;
                    }

                    if (notes.length > 0) {
                        feature.notes = notes;
                    }

                    if(source.track_type === "NUMERIC") {
                        feature.score = entity[source.score_attr];
                    }

                    setStyleProperties(entity, feature, source);
                    feature.molgenis = true;
        		    features.push(feature);
        		}
        		callback(null, features);
    	    }
    	}
	
    };
    
    thisB.busy++;
    thisB.notifyActivity();

    req.open('GET', url, true);
    req.responseType = 'text';
    req.send('');
}

function setStyleProperties(entity, feature, source) {

    var type = source.track_type;
    var altAttr = source.genome_attrs.alt;
    var refAttr = source.genome_attrs.ref;
    if(type === "NUMERIC"){
        feature.type = "numeric";
        return;
    }
    if(type === "EXON") {
        var labelAttr = source.label_attr;
        if (entity[labelAttr].search(source.exon_key) != -1) {
            feature.type = "exon";
            feature.method = "exon";
            return;
        }
        else{
            feature.type = "exon";
            feature.method = "intron";
            return;
        }
    }
    else if(altAttr && entity[altAttr] && refAttr && entity[refAttr]) {
        if (entity[altAttr].length > 1 || entity[refAttr].length > 1) {
            feature.type = "indel";
            return;
        }
        else if (entity[altAttr] === 'A') {
            feature.type = "variant";
            feature.method = "A";
            return;
        }
        else if (entity[altAttr] === 'T') {
            feature.type = "variant";
            feature.method = "T";
            return;
        }
        else if (entity[altAttr] === 'G') {
            feature.type = "variant";
            feature.method = "G";
            return;
        }
        else if (entity[altAttr] === 'C') {
            feature.type = "variant";
            feature.method = "C";
            return;
        }
        else if (entity[altAttr].search(',') != -1) {
            feature.type = "variant";
            feature.method = "multiple";
            return;
        }
        else {
            feature.type = "variant";
            feature.method = "unknown";
            return;
        }
    }else{
        feature.type = "default";
        return;
    }
}

dalliance_registerSourceAdapterFactory('molgenis', function(source) {
    return {features: new MolgenisFeatureSource(source)};
});
