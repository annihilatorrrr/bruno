import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import classnames from 'classnames';
import { safeStringifyJSON } from 'utils/common';
import QueryResult from 'components/ResponsePane/QueryResult';
import ResponseHeaders from 'components/ResponsePane/ResponseHeaders';
import StatusCode from 'components/ResponsePane/StatusCode';
import ResponseTime from 'components/ResponsePane/ResponseTime';
import ResponseSize from 'components/ResponsePane/ResponseSize';
import TestResults from 'components/ResponsePane/TestResults';
import TestResultsLabel from 'components/ResponsePane/TestResultsLabel';
import StyledWrapper from './StyledWrapper';
import SkippedRequest from 'components/ResponsePane/SkippedRequest';
import RunnerTimeline from 'components/ResponsePane/RunnerTimeline';
import ScriptError from 'components/ResponsePane/ScriptError';
import ScriptErrorIcon from 'components/ResponsePane/ScriptErrorIcon';

const ResponsePane = ({ rightPaneWidth, item, collection }) => {
  const [selectedTab, setSelectedTab] = useState('response');
  const [showScriptErrorCard, setShowScriptErrorCard] = useState(false);

  const { requestSent, responseReceived, testResults, assertionResults, preRequestTestResults, postResponseTestResults, error } = item;

  useEffect(() => {
    if (item?.preRequestScriptErrorMessage || item?.postResponseScriptErrorMessage || item?.testScriptErrorMessage) {
      setShowScriptErrorCard(true);
    }
  }, [item?.preRequestScriptErrorMessage, item?.postResponseScriptErrorMessage, item?.testScriptErrorMessage]);

  const headers = get(item, 'responseReceived.headers', []);
  const status = get(item, 'responseReceived.status', 0);
  const size = get(item, 'responseReceived.size', 0);
  const duration = get(item, 'responseReceived.duration', 0);

  const hasScriptError = item?.preRequestScriptErrorMessage || item?.postResponseScriptErrorMessage || item?.testScriptErrorMessage;

  const selectTab = (tab) => setSelectedTab(tab);

  const getTabPanel = (tab) => {
    switch (tab) {
      case 'response': {
        return (
          <QueryResult
            item={item}
            collection={collection}
            width={rightPaneWidth}
            disableRunEventListener={true}
            data={responseReceived.data}
            dataBuffer={responseReceived.dataBuffer}
            headers={responseReceived.headers}
            error={error}
            key={item.filename}
          />
        );
      }
      case 'headers': {
        return <ResponseHeaders headers={headers} />;
      }
      case 'timeline': {
        return (
          <RunnerTimeline
            request={requestSent}
            response={responseReceived}
            item={item}
            collection={collection}
          />
        );
      }
      case 'tests': {
        return <TestResults
          results={testResults}
          assertionResults={assertionResults}
          preRequestTestResults={preRequestTestResults}
          postResponseTestResults={postResponseTestResults}
        />;
      }

      default: {
        return <div>404 | Not found</div>;
      }
    }
  };

  const getTabClassname = (tabName) => {
    return classnames(`tab select-none ${tabName}`, {
      active: tabName === selectedTab
    });
  };

  if (item.status === 'skipped') {
    return (
      <StyledWrapper className="flex h-full relative">
        <SkippedRequest />
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper className="flex flex-col h-full relative overflow-auto">
      <div className="flex items-center tabs overflow-visible" role="tablist">
        <div className={getTabClassname('response')} role="tab" onClick={() => selectTab('response')}>
          Response
        </div>
        <div className={getTabClassname('headers')} role="tab" onClick={() => selectTab('headers')}>
          Headers
          {headers?.length > 0 && <sup className="ml-1 font-medium">{headers.length}</sup>}
        </div>
        <div className={getTabClassname('timeline')} role="tab" onClick={() => selectTab('timeline')}>
          Timeline
        </div>
        <div className={getTabClassname('tests')} role="tab" onClick={() => selectTab('tests')}>
          <TestResultsLabel
            results={testResults}
            assertionResults={assertionResults}
            preRequestTestResults={preRequestTestResults}
            postResponseTestResults={postResponseTestResults}
          />
        </div>
        <div className="flex flex-grow justify-end items-center">
          {hasScriptError && !showScriptErrorCard && (
            <ScriptErrorIcon
              itemUid={item.uid}
              onClick={() => setShowScriptErrorCard(true)}
            />
          )}
          <StatusCode status={status} />
          <ResponseTime duration={duration} />
          <ResponseSize size={size} />
        </div>
      </div>
      <section className="flex flex-col flex-grow overflow-auto">
        {hasScriptError && showScriptErrorCard && (
          <ScriptError
            item={item}
            onClose={() => setShowScriptErrorCard(false)}
          />
        )}
        <div className='flex-1'>
          {getTabPanel(selectedTab)}
        </div>
      </section>
    </StyledWrapper>
  );
};

export default ResponsePane;
