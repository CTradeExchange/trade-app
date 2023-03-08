//
//  SnUniAppsFlyerModule.h
//  FBSDKCoreKit
//
//  Created by itfenbao on 2021/4/9.
//

#import <Foundation/Foundation.h>
#import "DCUniModule.h"
#import "AppsFlyerLib.h"
#import <objc/message.h>

typedef void (*bypassDidFinishLaunchingWithOption)(id, SEL, NSInteger);

NS_ASSUME_NONNULL_BEGIN

@interface SnUniAppsFlyerModule : DCUniModule <AppsFlyerLibDelegate, AppsFlyerDeepLinkDelegate>

@end

NS_ASSUME_NONNULL_END

static NSString *const NO_DEVKEY_FOUND = @"No 'devKey' found or its empty";
static NSString *const NO_APPID_FOUND = @"No 'appId' found or its empty";
static NSString *const NO_EVENT_NAME_FOUND = @"No 'eventName' found or its empty";
static NSString *const EMPTY_OR_CORRUPTED_LIST = @"No arguments found or list is corrupted";
static NSString *const SUCCESS = @"Success";
static NSString *const INVALID_URI = @"Invalid URI";
static NSString *const IOS_14_ONLY = @"Feature only supported on iOS 14 and above";

// Appsflyer JS objects
#define afDevKey @"devKey"
#define afAppId @"appId"
#define afIsDebug @"isDebug"
#define timeToWaitForATTUserAuthorization @"timeToWaitForATTUserAuthorization"

#define afEmailsCryptType @"emailsCryptType"
#define afEmails @"emails"

// Appsflyer native objects
#define afConversionData @"onInstallConversionDataListener"
#define afOnInstallConversionData @"onInstallConversionData"
#define afSuccess @"success"
#define afFailure @"failure"
#define afOnAttributionFailure @"onAttributionFailure"
#define afOnAppOpenAttribution @"onAppOpenAttribution"
#define afOnInstallConversionFailure @"onInstallConversionFailure"
#define afOnInstallConversionDataLoaded @"onInstallConversionDataLoaded"
#define afDeepLink @"onDeepLinkListener"
#define afOnDeepLinking @"onDeepLinking"

// User Invites, Cross Promotion
#define afCpAppID @"crossPromotedAppId"
#define afUiChannel @"channel"
#define afUiCampaign @"campaign"
#define afUiRefName @"referrerName"
#define afUiImageUrl @"referrerImageUrl"
#define afUiCustomerID @"customerID"
#define afUiBaseDeepLink @"baseDeepLink"

//RECEIPT VALIDATION
#define afProductIdentifier @"productIdentifier"
#define afTransactionId @"transactionId"
#define afPrice @"price"
#define afCurrency @"currency"
#define afAdditionalParameters @"additionalParameters"
static NSString *const NO_PARAMETERS_ERROR = @"No purchase parameters found";
static NSString *const VALIDATE_SUCCESS = @"In-App Purchase Validation success";
static NSString *const VALIDATE_FAILED = @"In-App Purchase Validation failed with error: ";
