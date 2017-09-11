import Editor from 'rsg-components/Editor';
import Usage from 'rsg-components/Usage';
import HtmlPreview from 'rsg-components/HtmlPreview';
import IsolateButton from './IsolateButton';
import CodeTabButton from './CodeTabButton';
import UsageTabButton from './UsageTabButton';

export var EXAMPLE_TAB_CODE_EDITOR = 'rsg-code-editor';
export var EXAMPLE_TAB_HTML_PREVIEW = 'rsg-html-preview';
export var DOCS_TAB_USAGE = 'rsg-usage';

var toolbar = [IsolateButton];

export default {
	sectionToolbar: toolbar,
	componentToolbar: toolbar,
	exampleToolbar: toolbar,
	exampleTabButtons: [{
		id: EXAMPLE_TAB_CODE_EDITOR,
		render: CodeTabButton
	}],
	exampleTabs: [{
		id: EXAMPLE_TAB_CODE_EDITOR,
		render: Editor
	}, {
		id: EXAMPLE_TAB_HTML_PREVIEW,
		render: HtmlPreview
	}],
	docsTabButtons: [{
		id: DOCS_TAB_USAGE,
		render: UsageTabButton
	}],
	docsTabs: [{
		id: DOCS_TAB_USAGE,
		render: Usage
	}]
};