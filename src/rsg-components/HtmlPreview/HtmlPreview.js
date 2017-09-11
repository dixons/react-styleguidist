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

const compileCode = (code, config) => transform(code, config).code;

const codemirrorOptions = {
	mode: 'htmlmixed',
	lineNumbers: false,
	lineWrapping: true,
	smartIndent: false,
	matchBrackets: true,
	viewportMargin: Infinity,
	readOnly: true,
};

// Wrap everything in a React component to leverage the state management of this component
class PreviewComponent extends Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
	};

	constructor() {
		super();
		this.state = {};
		this.setState = this.setState.bind(this);
		this.setInitialState = this.setInitialState.bind(this);
	}

	// Synchronously set initial state, so it will be ready before first render
	// Ignore all consequent calls
	setInitialState(initialState) {
		Object.assign(this.state, initialState);
		this.setInitialState = noop;
	}

	render() {
		return this.props.component(this.state, this.setState, this.setInitialState);
	}
}

export default class HtmlPreview extends Component {
	static propTypes = {
		code: PropTypes.string.isRequired,
		evalInContext: PropTypes.func.isRequired,
	};
	static contextTypes = {
		config: PropTypes.object.isRequired,
	};

	state = {
		error: null,
		markup: null,
	};

	componentDidMount() {
		this.executeCode();
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (
			this.state.error !== nextState.error ||
			this.props.code !== nextProps.code ||
			this.state.markup !== nextState.markup
		);
	}

	componentDidUpdate(prevProps) {
		if (this.props.code !== prevProps.code) {
			this.executeCode();
		}
	}

	componentWillUnmount() {
		this.unmountPreview();
	}

	unmountPreview() {
		if (this.mountNode) {
			ReactDOM.unmountComponentAtNode(this.mountNode);
		}
	}

	executeCode() {
		this.setState({
			error: null,
		});

		const { code } = this.props;
		if (!code) {
			return;
		}

		const compiledCode = this.compileCode(code);
		if (!compiledCode) {
			return;
		}

		const exampleComponent = this.evalInContext(compiledCode);
		const wrappedComponent = (
			<Wrapper>
				<PreviewComponent component={exampleComponent} />
			</Wrapper>
		);

		window.requestAnimationFrame(() => {
			this.unmountPreview();
			this.setState({
				markup: ReactDOMServer.renderToStaticMarkup(wrappedComponent),
			});
		});
	}

	compileCode(code) {
		return compileCode(code, this.context.config.compilerConfig);
	}

	evalInContext(compiledCode) {
		const exampleComponentCode = `
			var stateWrapper = {
				set initialState(value) {
					__setInitialState(value)
				},
			}
			with (stateWrapper) {
				return eval(${JSON.stringify(compiledCode)})
			}
		`;

		return this.props.evalInContext(exampleComponentCode);
	}

	render() {
		const { markup } = this.state;
		const { highlightTheme } = this.context.config;
		const options = {
			...codemirrorOptions,
			theme: highlightTheme,
		};

		return <CodeMirror value={markup} options={options} />;
	}
}
