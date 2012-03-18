define(function(require) {
    'use strict';
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');

    var mediator = require('mediator');
    var eventModulesHub = require('eventModulesHub');
    var modalEditorView = require('views/guicore/Modals/modalEditorView');

    var DocTreeView = require('views/guicore/DocTreeView/DocTreeView');
    var ComponentModel = require('models/ComponentModel');
    var ComponentCollection = require('collections/ComponentCollection');

    var MainView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'render', 'walkTreeView');
            this.doctree = new DocTreeView({
                tagName: 'div',
                id: 'doctree',
                className: 'tree-panel',
                //contextMenu: contextMenuView,
                rootFullName: 'TS_810',
                rootName: '810'
            });
            this.doctree.componentCollection.fetch({
                context: this.doctree,
                success: _.bind(function() {
                    this.doctree.render();
                    this.walkTreeView(this.doctree.componentCollection.at(0));
                }, this)
            });
            mediator.proxyAllEvents(this.doctree);
        },

        render: function() {
            $('.sidebar-nav').append(this.doctree.el);
            return this;
        },

        debugJSON: function() {
            $.ajax({
                context: this,
                url: '/document',
                success: function(data) {
                    var $pre = $('<pre/>', { 'class': 'prettyprint' });
                    var $code = $('<code/>', { 'class': 'language-js' });
                    $code.append(JSON.stringify(data, null, 4));
                    $('#content').append($pre.append($code));
                }
            });
        },

        walkTreeView: function(model) {
            if (model && model.componentCollection && model.schema) {
                _.each(model.schema.collection, function(value) {
                    if (_.include(['Table_1', 'Table_2', 'Table_3'], value.name) ||
                        _.include(['M', 'M/Z'], value.req)) {
                        var schema = model.schema.collection[value.fullName];
                        var newModel = new ComponentModel({
                            name: schema.name,
                            fullName: schema.fullName,
                            schema: schema || null,
                            componentCollection: schema && schema.collection &&
                                                 new ComponentCollection() || null
                        });
                        model.componentCollection.add(newModel);
                        this.walkTreeView(newModel);
                    }
                }, this);
            }
        }
    });

    return MainView;
});
