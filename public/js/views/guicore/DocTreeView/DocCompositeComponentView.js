/*global define:true, $:true, Backbone:true, _:true, Handlebars:true*/
define(function(require) {
    'use strict';
    var CompositeComponentView = require('views/guicore/TreeView/CompositeComponentView');

    var DocCompositeComponentView = CompositeComponentView.extend({
        initialize: function(options) {
            CompositeComponentView.prototype.initialize.call(this, options);
            this.schema = options.schema || {};
            this._initState = true;
        },

        render: function() {
            this.$el.empty();
            this.$el.append(this.template({
                label: this.model.get('name'),
                fullName: this.model.schema.fullName
            }));
            this.$componentCollection = this.$el.children('.tvc-ul');
            this.$tvcHandle = this.$('.handle');
            this.$tvcToggle = this.$tvcHandle.children('i');
            if (this.model.componentCollection) {
                this.addAll();
            }
            this.trigger('render:' + this._type, this);
            if (_.include(['M', 'M/Z'], this.model.schema.req) ||
                _.include(['810', 'Table_1', 'Table_2', 'Table_3'], this.model.schema.name)) {
                    this.$el.find('.tvc-label').css({ 'color': 'red' });
            }
            this._initState = false;
            return this;
        }
    });

    return DocCompositeComponentView;
});
