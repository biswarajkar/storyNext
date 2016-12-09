//Variables
var pos_element='pos-words';
var neg_element='neg-words';
var pos_sentiment_path="data/positive_words.txt";
var neg_sentiment_path="data/negative_words.txt";
var stop_word = "poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall";


//HTTP Standard AJAX Implementation for Asynchronous Calls
//https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started#Step_5_–_Working_with_data
function ajax_request(callback,url) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onload = function(){ // when the request is loaded
        callback(httpRequest.responseText);// we're calling our method
    };
    httpRequest.open('GET',url);
    httpRequest.send();
}

//AJAX Call (Using Promise API of ECMAScript 6) for Synchronous Data Passing using Promises
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
function ajax_request(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            resolve(this.responseText);
        };
        xhr.onerror = reject;
        xhr.open('GET', url);
        xhr.send();
    });
}

//Function which populates the HTML elements storing the positive and negative words from the lexicon
//Opinion Lexicon is by Minqing Hu and Bing Liu. "Mining and Summarizing Customer Reviews."
//       Proceedings of the ACM SIGKDD International Conference on Knowledge
//       Discovery and Data Mining (KDD-2004), Aug 22-25, 2004, Seattle,
//       Washington, USA
function populateSentimentWords(){
    ajax_request(pos_sentiment_path).then(function(result_p) {
        document.getElementById(pos_element).value=result_p;
    }).catch(function() {
        console.log("Error evaluating positive sentiment files, all default sentiments returned");
        document.getElementById(pos_element).value="";
    });

    ajax_request(neg_sentiment_path).then(function(result_n) {
        document.getElementById(neg_element).value=result_n;
    }).catch(function() {
        console.log("Error evaluating negative sentiment files, all default sentiments returned");
        document.getElementById(neg_element).value="";
    });
}

//Calculate Sentiment of the world passed (Lexicon based matching)
//http://www.cs.uic.edu/~liub/FBS/sentiment-analysis.html
function getSentiment(searchString){

    var pos_sent=document.getElementById('pos-words').value;
    var neg_sent=document.getElementById('neg-words').value;

    var myRe = new RegExp("\\b" + searchString + "\\b((?!\\W(?=\\w))|(?=\\s))", "gi"),
        myArray;

    while ((myArray = myRe.exec(pos_sent)) !== null) {
        return 1;
    }

    while ((myArray = myRe.exec(neg_sent)) !== null) {
        return 0;
    }

    return -1;
}

//Return the sentiment as a string from numerical values
function expressSentiment(val){
    if (val==1)
        return "Positive";
    else if (val==0)
        return "Negative";
    else if (val==-1)
        return "Undetermined";
    else
        return "Neutral";
}

//Method to copy objects and its attributes without passing reference (by value)
function shallowCopy( original )
{
    // First create an empty object with
    // same prototype of our original source
    var clone = Object.create( Object.getPrototypeOf( original ) ) ;

    var i , keys = Object.getOwnPropertyNames( original ) ;

    for ( i = 0 ; i < keys.length ; i ++ )
    {
        // copy each property into the clone
        Object.defineProperty( clone , keys[ i ] ,
            Object.getOwnPropertyDescriptor( original , keys[ i ] )
        ) ;
    }

    return clone ;
}

//Sorts the array objects based on decreasing order of size and returns the Top n elements
function getTopNbySize(arrayOfObjects,n) {
    if (arrayOfObjects.length==n)
        return arrayOfObjects;

    var sortedObj = arrayOfObjects.slice(0);
    sortedObj.sort(function(a,b) {
        return b.size - a.size;
    });

    var topNobj = sortedObj.slice(0,n);

    return topNobj;
}

//Function to calculate the number of occurrences of each word passed in a list
//If key_flag=1, stop words (like I, me, Myself etc.) are removed from the list
//              and counts of all of the rest of the words is returned
//              Else, a count of all words along with each word is returned
function countOccurences(word_tokens,key_flag) {

    var output=[];
    word_tokens.forEach(function(wrd) {
        if (key_flag){
            if (wrd != "" && stop_word.indexOf(wrd) == -1 && wrd.length > 1) {
                if (output[wrd])
                    output[wrd]++;
                else
                    output[wrd] = 1;
            }
        }
        else{
            if (!output[wrd])
                output[wrd] = 0;
            output[wrd] += 1;
        }
    });

    return output;
}

//Function to process text, split into words, count occurrences and compute sentiments
//If sent_flag=1, the perceived sentiment value is also returned along with frequency of words
//If key_flag=1, stop words (like I, me, Myself etc.) are removed from the frequency list
function getFrequencyList(passed_text,sent_flag,key_flag){

    if (passed_text=="" || passed_text==null || passed_text==undefined){
        console.log("WARNING: No data Passed to getFrequencyList");
    }
    else
        passed_text=passed_text.toLowerCase();

    //Tokenize all words by removing spaces and special characters
    var tokenized_text = passed_text.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);

    //Count the occurrences of each word
    var freq_hashmap = countOccurences(tokenized_text,key_flag);

    //Add sentiment scores if needed
    var freq_list=[];
    Object.keys(freq_hashmap).sort().forEach(function(wd) {
        if (sent_flag==true) {
            freq_list.push({"text": wd, "size": freq_hashmap[wd], "sentiment": getSentiment(wd)});
        }else
            freq_list.push({"text": wd, "size": freq_hashmap[wd]});
    });

    function filterByID(obj) {
        if (obj.text !== undefined && obj.text !== "" && typeof(obj.size) === 'number' && !isNaN(obj.size)) {
            return true;
        } else {
            return false;
        }
    }

    return freq_list.filter(filterByID);
}
