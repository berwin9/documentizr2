define(function(require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    
    var TreeView = require('views/guicore/TreeView/TreeView');
    var SegmentTreeViewComposite = require('views/guicore/SegmentTreeView/SegmentTreeViewComposite');
    var SegmentTreeViewLeaf = require('views/guicore/SegmentTreeView/SegmentTreeViewLeaf');
    var SegmentsCollection = require('collections/SegmentsCollection');

    var SegmentTreeView = TreeView.extend({
        tagName: 'div',

        initialize: function(options) {
            _.bindAll(this, 'render', 'addOne', 'addAll');
            this.segments = this.collection = options.collection || new SegmentsCollection();
            this.segments.bind('add', this.addOne); 
            this.subscriber = options.subscriber || { trigger: function() { /** no op **/ } };
            this.$segments = $('<ul/>', { 'class': 'tvc' });
        },

        render: function() {
            $(this.el).empty();
            $(this.el).append(this.$segments);
            this.addAll();
            return this;
        },

        addOne: function(model) {
            var view = null;
            if (model.segments) {
                view = new SegmentTreeViewComposite({ model: model, subscriber: this.subscriber });
                view.$el.droppable({
                    drop: view.onDrop,
                    greedy: true,
                    accept: '.tvc',
                    tolerance: 'pointer',
                    over: view.onHoverEnter,
                    out: view.onHoverExit
                });
                view.render().$collection
                    .sortable({
                        helper: 'clone',
                        handle: '.handle',
                        placeholder: 'ui-state-highlight'
                    }) 
                    .selectable();
            } else {
                view = new SegmentTreeViewLeaf({ model: model, subscriber: this.subscriber });
                view.render();
            }
            this.$segments.append(view.el);
        },

        addAll: function () {
            this.segments.each(this.addOne);
        }
    });
    return SegmentTreeView;
});
