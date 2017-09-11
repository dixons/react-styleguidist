var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { transform } from 'buble';
import 'codemirror/mode/htmlmixed/htmlmixed';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CodeMirror from 'react-codemirror2';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import Wrapper from 'rsg-components/Wrapper';

/* eslint-disable react/no-multi-comp */

// We’re explicitly specifying Webpack loaders here so we could skip specifying them in Webpack configuration.
// That way we could avoid clashes between our loaders and user loaders.
// eslint-disable-next-line import/no-unresolved
require('!!../../../loaders/style-loader!../../../loaders/css-loader!codemirror/lib/codemirror.css');
// eslint-disable-next-line import/no-unresolved
require('!!../../../loaders/style-loader!../../../loaders/css-loader!rsg-codemirror-theme.css');

var _compileCode = function _compileCode(code, config) {
	return transform(code, config).code;
};

var codemirrorOptions = {
	mode: 'htmlmixed',
	lineNumbers: false,
	lineWrapping: true,
	smartIndent: false,
	matchBrackets: true,
	viewportMargin: Infinity,
	readOnly: true
};

// Wrap everything in a React component to leverage the state management of this component

var PreviewComponent = function (_Component) {
	_inherits(PreviewComponent, _Component);

	function PreviewComponent() {
		_classCallCheck(this, PreviewComponent);

		var _this = _possibleConstructorReturn(this, (PreviewComponent.__proto__ || Object.getPrototypeOf(PreviewComponent)).call(this));

		_this.state = {};
		_this.setState = _this.setState.bind(_this);
		_this.setInitialState = _this.setInitialState.bind(_this);
		return _this;
	}

	// Synchronously set initial state, so it will be ready before first render
	// Ignore all consequent calls


	_createClass(PreviewComponent, [{
		key: 'setInitialState',
		value: function setInitialState(initialState) {
			Object.assign(this.state, initialState);
			this.setInitialState = noop;
		}
	}, {
		key: 'render',
		value: function render() {
			return this.props.component(this.state, this.setState, this.setInitialState);
		}
	}]);

	return PreviewComponent;
}(Component);

PreviewComponent.propTypes = {
	component: PropTypes.func.isRequired
};

var HtmlPreview = function (_Component2) {
	_inherits(HtmlPreview, _Component2);

	function HtmlPreview() {
		var _ref;

		var _temp, _this2, _ret;

		_classCallCheck(this, HtmlPreview);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = HtmlPreview.__proto__ || Object.getPrototypeOf(HtmlPreview)).call.apply(_ref, [this].concat(args))), _this2), _this2.state = {
			error: null,
			markup: null
		}, _temp), _possibleConstructorReturn(_this2, _ret);
	}

	_createClass(HtmlPreview, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.executeCode();
		}
	}, {
		key: 'shouldComponentUpdate',
		value: function shouldComponentUpdate(nextProps, nextState) {
			return this.state.error !== nextState.error || this.props.code !== nextProps.code || this.state.markup !== nextState.markup;
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate(prevProps) {
			if (this.props.code !== prevProps.code) {
				this.executeCode();
			}
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			this.unmountPreview();
		}
	}, {
		key: 'unmountPreview',
		value: function unmountPreview() {
			if (this.mountNode) {
				ReactDOM.unmountComponentAtNode(this.mountNode);
			}
		}
	}, {
		key: 'executeCode',
		value: function executeCode() {
			var _this3 = this;

			this.setState({
				error: null
			});

			var code = this.props.code;

			if (!code) {
				return;
			}

			var compiledCode = this.compileCode(code);
			if (!compiledCode) {
				return;
			}

			var exampleComponent = this.evalInContext(compiledCode);
			var wrappedComponent = React.createElement(
				Wrapper,
				null,
				React.createElement(PreviewComponent, { component: exampleComponent })
			);

			window.requestAnimationFrame(function () {
				_this3.unmountPreview();
				_this3.setState({
					markup: ReactDOMServer.renderToStaticMarkup(wrappedComponent)
				});
			});
		}
	}, {
		key: 'compileCode',
		value: function compileCode(code) {
			return _compileCode(code, this.context.config.compilerConfig);
		}
	}, {
		key: 'evalInContext',
		value: function evalInContext(compiledCode) {
			var exampleComponentCode = '\n\t\t\tvar stateWrapper = {\n\t\t\t\tset initialState(value) {\n\t\t\t\t\t__setInitialState(value)\n\t\t\t\t},\n\t\t\t}\n\t\t\twith (stateWrapper) {\n\t\t\t\treturn eval(' + JSON.stringify(compiledCode) + ')\n\t\t\t}\n\t\t';

			return this.props.evalInContext(exampleComponentCode);
		}
	}, {
		key: 'render',
		value: function render() {
			var markup = this.state.markup;
			var highlightTheme = this.context.config.highlightTheme;

			var options = _extends({}, codemirrorOptions, {
				theme: highlightTheme
			});

			return React.createElement(CodeMirror, { value: markup, options: options });
		}
	}]);

	return HtmlPreview;
}(Component);

HtmlPreview.propTypes = {
	code: PropTypes.string.isRequired,
	evalInContext: PropTypes.func.isRequired
};
HtmlPreview.contextTypes = {
	config: PropTypes.object.isRequired
};
export default HtmlPreview;