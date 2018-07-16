from flask.ext.appbuilder import RestCRUDView,get_order_args,get_page_size_args

class OrModelView(RestCRUDView):
    """
        This is the CRUD generic view.
        If you want to automatically implement create, edit,
        delete, show, and list from your database tables, inherit your views from this class.

        Notice that this class inherits from BaseCRUDView and BaseModelView
        so all properties from the parent class can be overriden.
    """

    def __init__(self, **kwargs):
        super(ModelView, self).__init__(**kwargs)

    def post_add_redirect(self):
        """Override this function to control the redirect after add endpoint is called."""
        return redirect(self.get_redirect())

    def post_edit_redirect(self):
        """Override this function to control the redirect after edit endpoint is called."""
        return redirect(self.get_redirect())

    def post_delete_redirect(self):
        """Override this function to control the redirect after edit endpoint is called."""
        return redirect(self.get_redirect())

    def _get_or_list_widget(self, filters,
                     actions=None,
                     order_column='',
                     order_direction='',
                     page=None,
                     page_size=None,
                     widgets=None,
                     **args):

    """ get joined base filter and current active filter for query """
    widgets = widgets or {}
    actions = actions or self.actions
    page_size = page_size or self.page_size
    if not order_column and self.base_order:
        order_column, order_direction = self.base_order
    joined_filters = filters.get_joined_filters(self._base_filters)
    count, lst = self.datamodel.query(joined_filters, order_column, order_direction, page=page, page_size=page_size)
    pks = self.datamodel.get_keys(lst)

    # serialize composite pks
    pks = [self._serialize_pk_if_composite(pk) for pk in pks]

    widgets['list'] = self.list_widget(label_columns=self.label_columns,
                                       include_columns=self.list_columns,
                                       value_columns=self.datamodel.get_values(lst, self.list_columns),
                                       order_columns=self.order_columns,
                                       formatters_columns=self.formatters_columns,
                                       page=page,
                                       page_size=page_size,
                                       count=count,
                                       pks=pks,
                                       actions=actions,
                                       filters=filters,
                                       modelview_name=self.__class__.__name__)
    return widgets

    """
    --------------------------------
            LIST
    --------------------------------
    """

    @expose('/list/')
    @has_access
    def list(self):

        """
            list function logic, override to implement different logic
            returns list and search widget
        """
        if get_order_args().get(self.__class__.__name__):
            order_column, order_direction = get_order_args().get(self.__class__.__name__)
        else:
            order_column, order_direction = '', ''
        page = get_page_args().get(self.__class__.__name__)
        page_size = get_page_size_args().get(self.__class__.__name__)
        get_filter_args(self._filters)
        widgets = self._get_or_list_widget(filters=self._filters,
                                        order_column=order_column,
                                        order_direction=order_direction,
                                        page=page,
                                        page_size=page_size)
        form = self.search_form.refresh()
        self.update_redirect()

        widgets = self._get_search_widget(form=form, widgets=widgets)
        return self.render_template(self.list_template,
                                    title=self.list_title,
                                    widgets=widgets)

    """
    --------------------------------
            SHOW
    --------------------------------
    """

    @expose('/show/<pk>', methods=['GET'])
    @has_access
    def show(self, pk):
        pk = self._deserialize_pk_if_composite(pk)
        widgets = self._show(pk)
        return self.render_template(self.show_template,
                                    pk=pk,
                                    title=self.show_title,
                                    widgets=widgets,
                                    related_views=self._related_views)

    """
    ---------------------------
            ADD
    ---------------------------
    """

    @expose('/add', methods=['GET', 'POST'])
    @has_access
    def add(self):
        widget = self._add()
        if not widget:
            return self.post_add_redirect()
        else:
            return self.render_template(self.add_template,
                                        title=self.add_title,
                                        widgets=widget)

    """
    ---------------------------
            EDIT
    ---------------------------
    """

    @expose('/edit/<pk>', methods=['GET', 'POST'])
    @has_access
    def edit(self, pk):
        pk = self._deserialize_pk_if_composite(pk)
        widgets = self._edit(pk)
        if not widgets:
            return self.post_edit_redirect()
        else:
            return self.render_template(self.edit_template,
                                        title=self.edit_title,
                                        widgets=widgets,
                                        related_views=self._related_views)

    """
    ---------------------------
            DELETE
    ---------------------------
    """

    @expose('/delete/<pk>')
    @has_access
    def delete(self, pk):
        pk = self._deserialize_pk_if_composite(pk)
        self._delete(pk)
        return self.post_delete_redirect()

    @expose('/download/<string:filename>')
    @has_access
    def download(self, filename):
        return send_file(self.appbuilder.app.config['UPLOAD_FOLDER'] + filename,
                         attachment_filename=uuid_originalname(filename),
                         as_attachment=True)


    @expose('/action/<string:name>/<pk>', methods=['GET'])
    def action(self, name, pk):
        """
            Action method to handle actions from a show view
        """
        pk = self._deserialize_pk_if_composite(pk)
        if self.appbuilder.sm.has_access(name, self.__class__.__name__):
            action = self.actions.get(name)
            return action.func(self.datamodel.get(pk))
        else:
            flash(as_unicode(FLAMSG_ERR_SEC_ACCESS_DENIED), "danger")
            return redirect('.')


    @expose('/action_post', methods=['POST'])
    def action_post(self):
        """
            Action method to handle multiple records selected from a list view
        """
        name = request.form['action']
        pks = request.form.getlist('rowid')
        if self.appbuilder.sm.has_access(name, self.__class__.__name__):
            action = self.actions.get(name)
            items = [self.datamodel.get(self._deserialize_pk_if_composite(pk)) for pk in pks]
            return action.func(items)
        else:
            flash(as_unicode(FLAMSG_ERR_SEC_ACCESS_DENIED), "danger")
            return redirect('.')