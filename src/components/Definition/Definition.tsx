
import { useState } from 'react'
import { useAtom } from 'jotai'
import { bookmarksAtom } from '../../atoms'
import { Definition } from '../../interfaces'
import { removeBookmark, addBookmark, checkBookmarked } from '../../utils'

const DefinitionComponent = ({
    definition,
    index,
    escapeHtml
}: {
    definition: Definition,
    index: number,
    escapeHtml: any
}) => {
    const [bookmarks, setBookmarks] = useAtom(bookmarksAtom)
    const [isBookmarked, setIsBookmarked] = useState(checkBookmarked(bookmarks, definition.word, definition.definition))

    const toggleBookmark = (word: string, pos: string, definition: string) => {
        setBookmarks(isBookmarked ? removeBookmark(bookmarks, word, definition) : addBookmark(bookmarks, word, definition))
        setIsBookmarked(!isBookmarked)
    }

    const getBookmarkIcon = (): string => {
        return isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'
    }

    return (
        <div className="defItem" key={index}>
            <div className="defContent">
            <div className="defNumber">{index + 1})</div>
            <div className="defText"><strong>{definition.pos}.</strong> {escapeHtml(definition.definition)}</div>
            </div>
            <button
            className="bookmarkBtn"
            onClick={() => toggleBookmark(definition.word, definition.pos, definition.definition)}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
            <i className={getBookmarkIcon()}></i>
            </button>
        </div>
    )
}

export default DefinitionComponent