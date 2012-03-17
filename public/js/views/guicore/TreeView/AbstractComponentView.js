/**
 * views/TreeView/guicore/AbstractComponent.js
 * ~~~~~~~~~~~~~~~~~~~
 * AbstractComponent
 *
 * @author erwin.mombay
 */

define(function(require) {
    'use strict';
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    
    //:~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //: AbstractComponent should not be instantiated.
    //: I had originally put a guard on the initialize method to throw
    //: an Error if anybody tried to initialize the class but in doing so
    //: the classes inheriting from AbstractComponent like CompositeComponent
    //: needs to rebind all the inherited methods using _.bindAll for it to work
    //: properly(which is a pain). I think it is better to sacrifice the guard
    //: so that we can call super() on AbstractComponent for it to do the binding
    //: on its initialize for the inheriting class. We use the `Abstract` naming
    //: convention to convey to the users/developers that AbstractComponent is not
    //: intended to be initialized. 
    //:~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var AbstractComponentView = Backbone.View.extend({
        tagName: 'li',
        
        //: tvc is an abbreviation for tree-view-component
        className: 'tvc',

        events: {
            'dblclick': '_onDoubleClick',
            'mousedown': '_onMouseDown'
        },

        constructor: function(options) {
            //: apply _properties as identifiers/obj properties
            var _properties = ['contextMenu'];
            //: we make our own constructor so that we can assign
            //: the object specifier before `initialize` is called. sometimes
            //: we create conditions inside the initialize that relies on properties
            //: passed to the object specifier. (ex. contextMenu object)
            _.each(options, function(value, key) {
                if (!this.hasOwnProperty(key) && _.include(_properties, key)) {
                    this[key] = value;
                }
            }, this);
            return Backbone.View.apply(this, arguments);
        },

        initialize: function(options) {
            _.bindAll(this, '_onDoubleClick', '_onDrop', '_onHoverEnter', '_onHoverExit',
                '_onMouseDown', '_onContextMenu', 'droppable', 'bindEventHandlers',
                'unbindEventHandlers');
            this._type = 'component';
            //: _type is used for namspacing the trigger events. ex. `doubleClick:composite`
            this.bindEventHandlers();
        },

        destroy: function() {
            this.off();
            this.unbindEventHandlers();
            this.remove();
        },

        bindEventHandlers: function() {
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.destroy, this);
            if (this.contextMenu) {
                //: doing a return false on the on.contextmenu event
                //: prevents the default browser's contextmenu to pop up
                this.$el.on('contextmenu', this._onContextMenu);
            }
        },

        unbindEventHandlers: function() {
            this.model.off('destroy', this.destroy, this);
            this.model.off('destroy', this.destroy, this);
            this.$el.off('contextmenu', this._onContextMenu);
        },

        _onContextMenu: function(e) {
            this.contextMenu.render({ viewContext: this, event: e });
            return false; 
        },

        _onDoubleClick: function(e) {
            this.trigger('doubleClick:' + this._type, { viewContext: this, event: e });
        },

        _onDrop: function(e, ui) {
            this.trigger('drop:' + this._type, { viewContext: this, event: e, ui: ui });
        },

        _onHoverEnter: function(e, ui) {
            this.trigger('hoverEnter:' + this._type, { viewContext: this, event: e, ui: ui });
        },

        _onHoverExit: function(e, ui) {
            this.trigger('hoverExit:' + this._type, { viewContext: this, event: e, ui: ui });
        },

        _onMouseDown: function(e) {
            //:~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //: Doing an event.stopPropagation() onmousedown causes $.selectable
            //: behavior to not trigger. Because of this our onmousedown sentinels are a little ugly
            //: and complicated. We make sure that the current event.target dom `is` this view.$el
            //: WARNING: if ever the standard composite and leaf html templates are changed, this
            //: sentinel/conditional might need to be updated to get the desired leftclick event.
            //:~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //: 1 is a mouse left click event.
            var $target = $(e.target);
            if (e.which == 1 && $target.closest('li').is(this.$el)) {
                this.trigger('leftClick:' + this._type, { viewContext: this, event: e });
            //: 3 is a mouse right click event
            } else if (e.which == 3 && $target.closest('li').is(this.$el)) {
                //: when rightClick viewContext menu is turned on, we stop propagation since
                //: the singleton contextMenuView attaches a mousedown listener to the body
                //: that makes the contextMenuView clear/hide itself when its current state `isVisible`
                this.trigger('rightClick:' + this._type, { viewContext: this, event: e });
            //: 2 is a middle click event
            } else if (e.which == 2 && $target.closest('li').is(this.$el)) {
                this.trigger('middleClick:' + this._type, { viewContext: this, event: e });
            }
        },

        droppable: function(spec) {
            var options = _.defaults(spec || {}, {
                greedy: true,
                accept: '.tvc',
                tolerance: 'pointer'
            });
            _.extend(options, {
                drop: this._onDrop,
                over: view._onHoverEnter,
                out: view._onHoverExit
            });
            this.$el.droppable(options);
            return this;
        }
    });

    return AbstractComponentView;
});


