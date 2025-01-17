<?php

namespace Common\Domains;

use Arr;
use Auth;
use Common\Core\AppUrl;
use Common\Core\BaseController;
use Common\Database\Datasource\Datasource;
use Common\Domains\Actions\DeleteCustomDomains;
use Common\Domains\Validation\HostIsNotBlacklisted;
use Common\Domains\CustomDomain;
use Exception;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;

class CustomDomainController extends BaseController
{
    const VALIDATE_CUSTOM_DOMAIN_PATH = 'secure/custom-domain/validate/2BrM45vvfS';

    public function __construct(
        protected CustomDomain $customDomain,
        protected Request $request,
    ) {
    }

    public function index()
    {
        $userId = $this->request->get('userId');
        $this->authorize('index', [get_class($this->customDomain), $userId]);

        $builder = $this->customDomain->newQuery();
        if ($userId) {
            $builder->where('user_id', '=', $userId);
        }
        if (request('global')) {
            $builder->orWhere('global', '=', true);
        }

        $datasource = new Datasource($builder, $this->request->all());

        return $this->success(['pagination' => $datasource->paginate()]);
    }

    public function store()
    {
        $this->authorize('store', get_class($this->customDomain));

        $this->validate($this->request, [
            'host' => [
                'required',
                'string',
                'max:100',
                Rule::unique('custom_domains'),
                new HostIsNotBlacklisted(),
            ],
            'global' => 'boolean',
        ]);

        $domain = $this->customDomain->create([
            'host' => $this->request->get('host'),
            'user_id' => Auth::id(),
            'global' => $this->request->get('global', false),
        ]);

        return $this->success(['domain' => $domain]);
    }

    public function update(CustomDomain $customDomain)
    {
        $this->authorize('store', $customDomain);

        $this->validate($this->request, [
            'host' => [
                'string',
                'max:100',
                Rule::unique('custom_domains')->ignore($customDomain->id),
                new HostIsNotBlacklisted(),
            ],
            'global' => 'boolean',
            'resource_id' => 'nullable|integer',
            'resource_type' => 'nullable|string',
        ]);

        $data = $this->request->all();
        $data['user_id'] = Auth::id();
        $data['global'] = $this->request->get('global', $customDomain->global);
        $customDomain->update($data);

        return $this->success(['domain' => $customDomain]);
    }

    public function destroy(string $ids)
    {
        $domainIds = explode(',', $ids);
        $this->authorize('destroy', [
            get_class($this->customDomain),
            $domainIds,
        ]);

        app(DeleteCustomDomains::class)->execute($domainIds);

        return $this->success();
    }

    public function authorizeCrupdate()
    {
        $this->authorize('store', get_class($this->customDomain));

        $domainId = $this->request->get('domainId');

        // don't allow attaching current site url as custom domain
        if (
            app(AppUrl::class)->requestHostMatches($this->request->get('host'))
        ) {
            return $this->error('', [
                'host' => __(
                    "Current site url can't be attached as custom domain.",
                ),
            ]);
        }

        $this->validate($this->request, [
            'host' => [
                'required',
                'string',
                'max:100',
                Rule::unique('custom_domains')->ignore($domainId),
                new HostIsNotBlacklisted(),
            ],
        ]);

        return $this->success([
            'serverIp' => $this->getServerIp(),
        ]);
    }

    /**
     * Proxy method for validation on frontend to avoid cross-domain issues.
     */
    public function validateDomainApi()
    {
        $this->validate($this->request, [
            'host' => ['required', 'string', new HostIsNotBlacklisted()],
        ]);

        $failReason = '';

        try {
            $host = parse_url($this->request->get('host'), PHP_URL_HOST);
            $dns = dns_get_record($host ?? $this->request->get('host'));
        } catch (Exception $e) {
            $dns = [];
        }

        $recordWithIp = Arr::first($dns, fn($record) => isset($record['ip']));
        if (
            empty($dns) ||
            (isset($recordWithIp) &&
                $recordWithIp['ip'] !== $this->getServerIp())
        ) {
            $failReason = 'dnsNotSetup';
        }

        $host = trim($this->request->get('host'), '/');
        try {
            $response = Http::get(
                "$host/" . self::VALIDATE_CUSTOM_DOMAIN_PATH,
            )->json();
        } catch (ConnectionException $e) {
            $response = [];
            $failReason = 'serverNotConfigured';
        }

        if (Arr::get($response, 'result') === 'connected') {
            return $response;
        } else {
            $failReason = 'serverNotConfigured';
        }

        return $this->error(__('Could not validate domain.'), [], 422, [
            'failReason' => $failReason,
        ]);
    }

    /**
     * Method for validating if CNAME for custom domain was attached properly.
     * @return Response
     */
    public function validateDomain()
    {
        return $this->success(['result' => 'connected']);
    }

    private function getServerIp(): string
    {
        return env('SERVER_IP') ??
            (env('SERVER_ADDR') ?? (env('LOCAL_ADDR') ?? env('REMOTE_ADDR')));
    }
}
