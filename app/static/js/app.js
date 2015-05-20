
var ToDoooUI = React.createClass({
  loadDataFromServer: function() {
    $.ajax({
      url: this.props.url,
      type: 'GET',
      dataType: 'json',
      cache: false,
      success: function(data) {

        if(data.hasOwnProperty('todo')) {
          var apiData = [];
          apiData.push(data.todo);
          this.setState({data: apiData});
        }

        else if (data.hasOwnProperty('todos')) {
          this.setState({data: data.todos});
          //console.log(data.todos);
        }

      }.bind(this),
      error: function(xhr, status, err) {
        alert('Error: Action not completed; can\'t talk to the API. Try again later.')
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleDataSubmit: function(data, id) {
    id = id || -1;
    console.log('id=' + id);

    var asJSON = JSON.stringify(data);
    
    $.ajax({
      url: (id != -1) ? this.props.url + id : this.props.url,
      dataType: 'json',
      contentType: 'application/json',
      type: 'POST',
      data: asJSON,
      username: 'guest',
      password: 'temp',
      success: function(data) {

        if(id == -1) {
          if(data.hasOwnProperty('todos') && $.isArray(data.todos)) {
            this.setState({data: data.todos});
          }
          
          if(data.hasOwnProperty('todo')) {
            var apiData = [];
            this.state.data.push(data.todo);
            this.setState({data: this.state.data});
          }
        }
      }.bind(this),
      error: function(xhr, status, err) {
        alert('Error: Action not completed; can\'t talk to the API. Try again later.')
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  getInitialState: function() {
    return {data: []};
  },

  componentDidMount: function() {
    this.loadDataFromServer();
    
    $(document).ready(function () {
    	$('#datepicker').datepicker();
    });

    //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },

  updateAllTodos: function(data, check) {
    this.handleDataSubmit(data);
    this.refs.todoList.checkAll(check);
  },

  updateSingleTodo: function(id, data) {
    this.handleDataSubmit(data, id);
  },

  render: function() {
    return (
      <div className="panel panel-default panel-position">
        <div className="panel-heading"><h3>To-Dooo</h3></div>
        <div className="panel-body panel-todos">
          <NewTodoForm onNewTodo = {this.handleDataSubmit} />
          <TodoList data = {this.state.data} url = {this.props.url} todoCount = {this.todoCount}
          updateSingleTodo = {this.updateSingleTodo} updateAllTodos = {this.updateAllTodos} ref = "todoList" />
        </div>        
      </div>
    );
  }
});


var todoCounter = 0;
var TodoList = React.createClass({
  getInitialState: function() {
    return {data: [], count: 0, leftCountStr: "", badgeColor: ""};
  },

  checkAll: function(check) {
    console.log(check);
    //alert('all');
    for(var key in this.refs) {
      if(key != "dialog") {
        var todo = this.refs[key];
        todo.checkAll(check);
      }
    }
    todoCounter = 0;
    this.setState({badgeColor: "badge-green"});
    this.setState({leftCountStr: "0 item(s) left"});
  },

  countLeft: function(done, initCount) {
    //var todoCounter = this.state.count;
    console.log(todoCounter);

    if(done) {
      if(todoCounter != 0 && !initCount) {
        todoCounter = todoCounter - 1;
      }
    }
    else {
      todoCounter = todoCounter + 1;
    }
    //this.setState({count: todoCounter});

    var badgeColor = (todoCounter == 0) ? "badge-green" : "badge-red"
    this.setState({badgeColor: badgeColor});
    this.setState({leftCountStr: todoCounter + " item(s) left"});
  },

  showDialog: function(dialogData) {
    this.refs.dialog.show(dialogData);
  },

  updateAllTodos: function(data) {
    this.props.updateAllTodos(data, true);
  },

  updateSingleTodo: function(id, data) {
    this.props.updateSingleTodo(id, data);
  },

  render: function() {
    var apiData = this.props.data;
    var url = this.props.url;

    var listNodes = apiData.map(function(todo, index) {
      return (
        <Todo key={index} data={todo} count={this.countLeft} dialog={this.showDialog} updateSingleTodo={this.updateSingleTodo} ref={'todo' + index} />
        )
    }.bind(this));

    return (
      <div>
        <div className="todo-list">{listNodes}</div>
        <Dialog ref="dialog" />

        <BottomBar leftCountStr={this.state.leftCountStr} onCompleteAll={this.updateAllTodos} 
        itemCount={this.props.data.length} badgeColor={this.state.badgeColor}/>
      </div>
    );
  }
});

var Todo = React.createClass({
  getInitialState: function() {
    return {done: false};
  },

  checkAll: function(check) {
    console.log(check);
    this.setState({done: check});
  },

  componentDidMount: function() {
    this.props.count(this.props.data.done, true);
    this.setState({done: this.props.data.done});
  },

  handleClick: function(e) {
    var check = this.state.done ? false : true;
    
    this.props.count(check);
    this.setState({done: check});

    this.props.updateSingleTodo(this.props.data.id, {done: check});


//    var asJSON = JSON.stringify({done: check});
//    
//    $.ajax({
//       url: this.props.url + this.props.id,
//       contentType: 'application/json',
//       type: 'POST',
//       dataType:'json',
//       data: asJSON,
//       cache: false,
//       username: 'guest',
//       password: 'temp',
//       success:function(data){
// //
//       }.bind(this),
//       error: function(xhr, status, err) {
//         console.log(xhr);
//         alert('Error: Action not completed; can\'t talk to the API. Try again later.')
//         this.props.count(!check);
//         this.setState({done: !check});
//       }.bind(this)

//     })
    //alert('key' + e.target.checked);
  },

  showDialog: function() {
    this.props.dialog(this.props.data);
  },

  render: function() {
    var crossedOut = this.state.done ? "crossedOut" : ""

    var date = new Date(this.props.data.duedate);
    var duedate = $(this).formatdate(date, "mm/dd/yyyy");

    return (
      <div className="block-div todo">
        <div className="left-one">
          <input type="checkbox" onChange={this.handleClick} checked={this.state.done} id={"item" + this.props.data.id}/>
          <label htmlFor={"item" + this.props.data.id} className={crossedOut}><h4 className="todo-title">{this.props.data.title}</h4></label>
        </div>
        <div className="duedate"><span className="glyphicon glyphicon-calendar" aria-hidden="true"></span> {duedate}</div>
        <a className="right-one label label-info" onClick={this.showDialog}>read more</a>
      </div>
    );
  }
});


var Dialog = React.createClass({
  getInitialState: function() {
    return {modalClass: "modal fade", data: []}
  },

  show: function(dialogData) {
    this.setState({data: dialogData});
    $("#myModal").modal('show');
  },

  hide: function() {
    this.setState({modalClass: "modal fade"});
  },

  render: function() {
    return (
    <div className={this.state.modalClass} id="myModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <div>
                <h4 className="list-group-item-heading">{this.state.data.title}</h4>
                <p className="list-group-item-text">Due: {this.state.data.duedate}</p>
              </div>
          </div>
          <div className="modal-body">
            {this.state.data.task}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    );
  }
});


var BottomBar = React.createClass({
  getInitialState: function() {
    return {markBool: true}
  },
  
  handleComplete: function(e) {
    var todoArr = []

    for(var i = 1; i <= this.props.itemCount; i++) {
      todoArr.push({id: i, done: this.state.markBool});
    }

    updateAll = { todos: todoArr }

    this.props.onCompleteAll(updateAll, this.state.markBool);
    //console.log(updateAll);
  },

  render: function() {
    return (
      <div>
        <hr className="bottom-split" />
        <div className="block-div bottom-bar">
          <div className={"badge left " + this.props.badgeColor}>&nbsp; {this.props.leftCountStr}</div>
          <div className="right"><span className="glyphicon glyphicon-check" aria-hidden="true"></span>&nbsp;
          <a href="#" ref="completeAll" onClick={this.handleComplete}>Mark all as complete</a></div>
        </div>
      </div>
      );
  }
});


var NewTodoForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    
    var task = React.findDOMNode(this.refs.task).value.trim();
    var title = React.findDOMNode(this.refs.title).value.trim();
    var duedate = React.findDOMNode(this.refs.duedate).value.trim();
    
    if (!task || !title || !duedate) {
      return;
    }

    this.props.onNewTodo({task: task, title: title, duedate: duedate});
    
    React.findDOMNode(this.refs.title).value = '';
    React.findDOMNode(this.refs.task).value = '';
    React.findDOMNode(this.refs.duedate).value = '';
  },

  render: function() {
    return (
      <form className="form-groups" id="submitForm" onSubmit={this.handleSubmit}>
        <div className="row">
          <div className="form-group col-md-8">
            <input type="text" placeholder="What needs to be done?" name="title" maxLength="36" ref="title" className="form-control" 
            data-error="You need to fill out what's on your mind.." required/>
            <div className="help-block with-errors"></div>
          </div>

          <div className="form-group col-md-4">
            <input type="text" placeholder="Due Date" name="duedate" id="datepicker" className="form-control" pattern="\d{1,2}/\d{1,2}/\d{4}"
            data-error="Enter/select date" ref="duedate" required/>
            <div className="help-block with-errors"></div>
          </div>
        </div>

        <div className="form-group">
          <input type="text" placeholder="Describe the task" name="task" maxLength="300" ref="task" className="form-control" required/>
          <div className="help-block with-errors"></div>
        </div>

        <button type="submit" className="btn btn-primary btn-large">
          &nbsp;<span className="glyphicon glyphicon-plus-sign" aria-hidden="true"></span> Add Todo
        </button>
      </form>
    );
  }
});


var APIendpoint = "/api/todos/"

React.render(
  <ToDoooUI url={APIendpoint} />,
  document.getElementById('to-dooo')
);