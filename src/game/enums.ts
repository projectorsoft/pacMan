export enum GameMode {
    Menu,
    Intro,
    Play
}

export enum GameState {
    None,
    Ready,
    Play,
    GameOver,
    Finished
}

export enum Direction {
    Left = 0,
    Right,
    Down,
    Top
}

export enum GhostType {
    Blinky,
    Pinky,
    Inky,
    Clyde
}

export enum GhostMode {
    Chase,
    Frightend,
    FrightendEnding,
    Eaten
}

export enum ScoreType {
    Pellet = 10,
    PowerUp = 50,
    Cherry = 100,
    Ghost = 200
}

export enum ObstacleType {
    Wall,
    Entrance //Entrance to ghosts house
}

export enum Keys {
    None = -1,
    Left = 37,
    Right = 39,
    Up = 38,
    Down = 40,
    Enter = 13
}

export enum WallType {
    HorizontalLine,
    VerticalLine,
    CornerTL,
    CornerTR,
    CornerBL,
    CornerBR,
    ConnectorT,
    ConnectorB,
    ConnectorL,
    ConnectorR,
    TerminatorL,
    TerminatorR,
    TerminatorT,
    TerminatorB,
    Block,
    None
}

export enum Color {
    White = 'rgb(255, 255, 255)',
    Blue = 'rgb(0, 162, 232)',
    Orange = 'rgb(255, 154,58)',
    Red = 'rgb(255, 0, 0)',
    Green = 'rgb(34, 177, 76)',
    Purple = 'rgb(224, 139, 219)'
}

export enum Asset {
    LogoImg = 'logoImg',
    WallsImg = 'wallIsmg',
    GhostsImg = 'ghostsImg',
    PlayerImg = 'playerImg',
    NewGameAudio = 'newGameAudio',
    ChompAudio = 'chompAudio',
    DeathAudio = 'deathAudio',
    PanicAudio = 'panicAudio',
    AlarmAudio = 'alarmAudio',
    RetreatingAudio = 'retreatingAudio',
    GhostEatenAudio = 'ghostEatenAudio',
    PixelCodeFont = 'pixelCodeFont',
    EnTranslations = 'enTranslations',
    PlTranslations = 'plTranslations'
}

export enum Timers {
    NewGame = 'newGame',
    EndGame = 'endGame',
    NextStage = 'nextStage',
    BeforeDie = 'beforeDie',
    AfterDie = 'afterDie',
}