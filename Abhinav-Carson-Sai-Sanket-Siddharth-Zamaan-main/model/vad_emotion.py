import string
import pandas as pd
import numpy as np
import json

valence_series = pd.read_csv("lexicon/valence-NRC-VAD-Lexicon.csv").set_index('word').squeeze()
arousal_series = pd.read_csv("lexicon/arousal-NRC-VAD-Lexicon.csv").set_index('word').squeeze()
dominance_series = pd.read_csv("lexicon/dominance-NRC-VAD-Lexicon.csv").set_index('word').squeeze()

anger_series = pd.read_csv("lexicon/anger-NRC-Emotion-Lexicon.csv").set_index('word').squeeze()
fear_series = pd.read_csv("lexicon/fear-NRC-Emotion-Lexicon.csv").set_index('word').squeeze()
anticipation_series = pd.read_csv("lexicon/anticipation-NRC-Emotion-Lexicon.csv").set_index('word').squeeze()
trust_series = pd.read_csv("lexicon/trust-NRC-Emotion-Lexicon.csv").set_index('word').squeeze()
surprise_series = pd.read_csv("lexicon/surprise-NRC-Emotion-Lexicon.csv").set_index('word').squeeze()
sadness_series = pd.read_csv("lexicon/sadness-NRC-Emotion-Lexicon.csv").set_index('word').squeeze()
joy_series = pd.read_csv("lexicon/joy-NRC-Emotion-Lexicon.csv").set_index('word').squeeze()
disgust_series = pd.read_csv("lexicon/disgust-NRC-Emotion-Lexicon.csv").set_index('word').squeeze()

SEGMENT_SIZE = 10




# returns [anger, fear, anticipation, trust, surprise, sadness, joy, disgust]
def get_word_emotion(word):
    return [
        int(anger_series[word]) if word in anger_series.index else 0,
        int(fear_series[word]) if word in fear_series.index else 0,
        int(anticipation_series[word]) if word in anticipation_series.index else 0,
        int(trust_series[word]) if word in trust_series.index else 0,
        int(surprise_series[word]) if word in surprise_series.index else 0,
        int(sadness_series[word]) if word in sadness_series.index else 0,
        int(joy_series[word]) if word in joy_series.index else 0,
        int(disgust_series[word]) if word in disgust_series.index else 0,
    ]

def compute_vad_from_string(s):
    s = s.translate(str.maketrans('', '', string.punctuation)).lower()
    token_list = s.split(" ")

    emotional_words = {}
    for word in token_list:
        if word not in emotional_words and word in valence_series.index:
            emotional_words[word] = {'valence': valence_series[word], 'arousal': arousal_series[word], 'dominance': dominance_series[word], 'emotion': get_word_emotion(word)}
    return json.dumps(emotional_words)

def compute_vad_for_tweet(d):
    no_of_emotional_words = len(d)
    if no_of_emotional_words == 0:
        return json.dumps({})
    vad = np.array([0.0,0.0,0.0])
    emotion = np.array([0,0,0,0,0,0,0,0])
    for word in d:
        vad += np.array([d[word]['valence'], d[word]['arousal'], d[word]['dominance']])
        emotion += np.array(d[word]['emotion'])
    vad = vad/no_of_emotional_words
    emotion = emotion/no_of_emotional_words
    return json.dumps({'valence': vad[0], 'arousal': vad[1], 'dominance':vad[2], 'emotion': list(emotion)})

def compute_vad_for_user(user_id):
    filename = f"tweet_dataset/{user_id}.csv"
    df_tweets = pd.read_csv(filename)
    df_tweets['Text'] = df_tweets['Text'].astype(str)
    df_tweets['Words_VAD_Emotion'] = df_tweets.apply(lambda row: compute_vad_from_string(row['Text']), axis=1)
    df_tweets['Tweet_VAD_Emotion'] = df_tweets.apply(lambda row: compute_vad_for_tweet(json.loads(row['Words_VAD_Emotion'])), axis=1)
    df_tweets.to_csv(filename, index=False)
    print(f"Computed VAD and emotion scores for {len(df_tweets)} tweets of user {user_id}.")

def compute_vad_for_segment(segment_vad_emotion_list):
    vad = np.array([0.0,0.0,0.0])
    emotion = np.array([0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0])
    count = 0
    for tweet in segment_vad_emotion_list:
        if len(tweet)>0:
            vad += np.array([tweet['valence'], tweet['arousal'], tweet['dominance']])
            emotion += np.array(tweet['emotion'])
            count+=1
    vad = vad/count
    emotion = emotion/count
    return json.dumps({'valence': vad[0], 'arousal': vad[1], 'dominance':vad[2], 'emotion': list(emotion)})

def segment_tweets(user_id):
    filename = f"tweet_dataset/{user_id}.csv"
    segment_filename = f"tweet_dataset/{user_id}_segment.csv"
    df_tweets = pd.read_csv(filename)
    if len(df_tweets) == 0:
        print(f"No tweets found for user {user_id}")
        return
    segment_id_column_list = []
    start_date_list = []
    segment_vad_emotion_column_list = []
    segment_vad_emotion_list = []
    segment_id = 0
    count = 0
    first = True
    for index, row in df_tweets.iterrows():
        if first:
            start_date_list.append(row['DateTime'])
            first = False
        d = json.loads(row['Tweet_VAD_Emotion'])
        if len(d) != 0 and d['emotion'] != [0, 0, 0, 0, 0, 0, 0, 0]:
                count += 1
        if count > SEGMENT_SIZE:
            count = 0
            segment_id+=1
            start_date_list.append(row['DateTime'])
            segment_vad_emotion_column_list.append(compute_vad_for_segment(segment_vad_emotion_list))
            segment_vad_emotion_list = [json.loads(row['Tweet_VAD_Emotion'])]
        else:
            segment_vad_emotion_list.append(json.loads(row['Tweet_VAD_Emotion']))
        segment_id_column_list.append(segment_id)
    segment_vad_emotion_column_list.append(compute_vad_for_segment(segment_vad_emotion_list))
    if len(segment_vad_emotion_column_list) > len(start_date_list):
        segment_vad_emotion_column_list = segment_vad_emotion_column_list[:-1]

    df_tweets['Segment_ID'] = segment_id_column_list
    df_tweets.to_csv(filename, index=False)
    print(len(start_date_list))
    print(len(segment_vad_emotion_column_list))
    df_segment = pd.DataFrame({'Segment_ID':sorted(list(set(segment_id_column_list))), 'DateTime': start_date_list, 'Segment_VAD_Emotion': segment_vad_emotion_column_list})
    df_segment.to_csv(segment_filename, index=False)
    print(f"Segmented {len(df_tweets)} tweets of user {user_id}.")
        
        
    

if __name__=="__main__":
    # user_ids = ["h3h3productions", "chrisbryanASU"]
    user_ids = ["h3h3productions", "chrisbryanASU","elonmusk", "POTUS", "hasanthehun"]
    for user_id in user_ids:
        compute_vad_for_user(user_id)
        segment_tweets(user_id)
