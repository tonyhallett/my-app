import { ActionButton, ActivityItem, IActivityItemProps, Icon, IconButton } from '@fluentui/react';
import React, { CSSProperties } from 'react';
import getFontFamily from './helpers/fontName';
import { Emphasis, LogMessage, MessageContext, Styling } from './types';

// use a map
function getIconNameForContext(messageContext:MessageContext){
  switch(messageContext){
    case MessageContext.Info:
      return "info";
    case MessageContext.Warning:
      return "warning";
    case MessageContext.Error:
      return "error";
    case MessageContext.CoverageStart:
      return "running";
    case MessageContext.TaskCompleted:
    case MessageContext.ReportGeneratorCompleted:
    case MessageContext.CoverageCompleted:
    case MessageContext.CoverageToolCompleted:
      return "completed";
    case MessageContext.ReportGeneratorStart:
      return "table";
    case MessageContext.CoverageToolStart:
      return "tool"
  }
}

function getIconNameForHostObjectMethod(hostObject:string,method:string){
  if(hostObject === 'fccOutputPane'){
    return 'openPane';
  }
  return 'navigate';
}

export function Log(props:{logMessages:LogMessage[],styling:Styling}) {
  const {logMessages,styling} = props;
  return <>
  {logMessages.map((logMessage,i) => {
    const activityDescription:React.ReactNode[] = [

    ];
    logMessage.message.forEach((msgPart,j) => {
      if(msgPart.type === 'emphasized' ){
        const emphasisStyle:CSSProperties={
          fontFamily:getFontFamily(styling.fontName),
          fontSize:styling.fontSize,
          color:styling.categoryColours.EnvironmentColors.ToolWindowText,
          backgroundColor:styling.categoryColours.EnvironmentColors.ToolWindowBackground
        }
        if(msgPart.emphasis & Emphasis.Bold){
          emphasisStyle.fontWeight='bold';
        }
        if(msgPart.emphasis & Emphasis.Italic){
          emphasisStyle.fontStyle='italic';
        }
        if(msgPart.emphasis & Emphasis.Underline){
          emphasisStyle.textDecoration = 'underline';
        }
        activityDescription.push(<span key='message' style={emphasisStyle}>{msgPart.message}</span>);
      }else{
        
        const actionButton = <ActionButton key='action' iconProps={{iconName:getIconNameForHostObjectMethod(msgPart.hostObject,msgPart.methodName)}} onClick={() => {
          const hostObject = (window as any).chrome.webview.hostObjects[msgPart.hostObject];
          const hostMethod:Function = hostObject[msgPart.methodName];
          hostMethod.apply(msgPart.arguments);
        }}>{msgPart.title}</ActionButton>
        activityDescription.push(actionButton);
      }
    })

    let activityIconProps:Partial<IActivityItemProps> = {
      activityDescription,
      activityIcon:<Icon iconName={getIconNameForContext(logMessage.context)}/>,
      isCompact:false
    }
    
    return <ActivityItem {...activityIconProps} key={i}/>
  })}
  </>
}
