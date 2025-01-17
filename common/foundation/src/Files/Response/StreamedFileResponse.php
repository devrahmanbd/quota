<?php

namespace Common\Files\Response;

use Common\Files\FileEntry;
use Common\Files\Response\FileResponse;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StreamedFileResponse implements FileResponse
{
    /**
     * @param FileEntry $entry
     * @param array $options
     * @return mixed
     */
    public function make(FileEntry $entry, $options)
    {
        $downloadName = str_replace(
            ['%', '/'],
            '',
            $entry->getNameWithExtension(),
        );

        $path = $entry->getStoragePath($options['useThumbnail']);
        $response = new StreamedResponse();
        $disposition = $response->headers->makeDisposition(
            $options['disposition'],
            $downloadName,
            Str::ascii($downloadName),
        );

        $fileSize = $options['useThumbnail']
            ? $entry->getDisk()->size($path)
            : $entry->file_size;

        $response->headers->replace([
            'Content-Type' => $entry->mime,
            'Content-Length' => $fileSize,
            'Content-Disposition' => $disposition,
            'Cache-Control' => 'private, max-age=31536000, no-transform',
            //'X-Accel-Buffering' => 'no',
        ]);
        $response->setCallback(function () use ($entry, $path) {
            $stream = $entry->getDisk()->readStream($path);
            if (!$stream) {
                abort(404);
            }

            while (!feof($stream)) {
                echo fread($stream, 2048);
            }
            fclose($stream);
        });
        return $response;
    }
}
