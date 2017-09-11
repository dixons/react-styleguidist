import React, { Component } from 'react';
import HtmlPreviewLoaderRenderer from 'rsg-components/HtmlPreview/HtmlPreviewLoaderRenderer';

export default class HtmlPreviewLoader extends Component {
	state = {
		HtmlPreview: null,
	};

	componentDidMount() {
		System.import('rsg-components/HtmlPreview/HtmlPreview').then(module => {
			this.setState({ HtmlPreview: module.default });
		});
	}

	render() {
		const HtmlPreview = this.state.HtmlPreview;
		if (HtmlPreview) {
			return <HtmlPreview {...this.props} />;
		}

		return <HtmlPreviewLoaderRenderer />;
	}
}
